require('dotenv').config({ path: require('path').join(__dirname, '.env'), override: true });
console.log('[Env] SUPABASE_URL:', process.env.SUPABASE_URL ? 'OK' : 'MISSING');
console.log('[Env] SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'OK' : 'MISSING');
console.log('[Env] JWT_SECRET:', process.env.JWT_SECRET ? 'OK' : 'MISSING');
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const Busboy = require('busboy');
const XLSX = require('xlsx');
const supabase = require('./server/db');
const { hashPassword, verifyPassword, signToken, authMiddleware } = require('./server/auth');

function requireRole(...roles) {
  return (req, res) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      sendJson(res, 403, { error: 'No tienes permiso para esta acción' });
      return false;
    }
    return true;
  };
}

const PORT = process.env.PORT || 3000;
const NVIDIA_HOST = 'integrate.api.nvidia.com';
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;

const MIME = {
  '.html': 'text/html;charset=utf-8',
  '.css': 'text/css;charset=utf-8',
  '.js': 'application/javascript;charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

function sendJson(res, code, obj) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(obj));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch (e) { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = filePath.split('?')[0];
  const fullPath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') sendJson(res, 404, { error: 'Not Found' });
      else sendJson(res, 500, { error: err.message });
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

function proxyToNVIDIA(req, res) {
  getBody(req).then(body => {
    const options = {
      hostname: NVIDIA_HOST,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_KEY}`,
        'Content-Type': 'application/json',
      }
    };
    const proxyReq = https.request(options, proxyRes => {
      let data = '';
      proxyRes.on('data', chunk => { data += chunk; });
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': proxyRes.headers['content-type'] || 'application/json'
        });
        res.end(data);
      });
    });
    proxyReq.on('error', err => sendJson(res, 502, { error: `Proxy error: ${err.message}` }));
    proxyReq.write(JSON.stringify(body));
    proxyReq.end();
  }).catch(() => sendJson(res, 400, { error: 'Invalid JSON' }));
}

/* ════════════════════════════════════════════════════════════
   API ROUTES
   ════════════════════════════════════════════════════════════ */

const API_ROUTES = {

  /* ──── AUTH ──── */

  async 'POST /api/register'(req, res) {
    const body = await getBody(req);
    const { email, password, nombre, empresa_nombre, empresa_rif } = body;
    if (!email || !password) return sendJson(res, 400, { error: 'Email y password requeridos' });
    const { data: exist } = await supabase.from('usuarios').select('id').eq('email', email).maybeSingle();
    if (exist) return sendJson(res, 409, { error: 'Email ya registrado' });
    let empresa_id = null;
    if (empresa_nombre) {
      const { data: emp } = await supabase.from('empresas').insert({ nombre: empresa_nombre, rif: empresa_rif || null }).select().single();
      if (emp) empresa_id = emp.id;
    }
    const password_hash = hashPassword(password);
    const { data: user, error } = await supabase.from('usuarios').insert({
      email, password_hash, nombre: nombre || email.split('@')[0], empresa_id
    }).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    const token = signToken({ id: user.id, email: user.email, nombre: user.nombre, empresa_id: user.empresa_id, rol: 'admin' });
    sendJson(res, 201, { token, user: { id: user.id, email: user.email, nombre: user.nombre, empresa_id: user.empresa_id, rol: 'admin' } });
  },

  async 'POST /api/login'(req, res) {
    const { email, password } = await getBody(req);
    if (!email || !password) return sendJson(res, 400, { error: 'Email y password requeridos' });
    const { data: user } = await supabase.from('usuarios').select('*').eq('email', email).maybeSingle();
    if (!user || !verifyPassword(password, user.password_hash))
      return sendJson(res, 401, { error: 'Credenciales inválidas' });
    const token = signToken({ id: user.id, email: user.email, nombre: user.nombre, empresa_id: user.empresa_id, rol: 'admin' });
    sendJson(res, 200, { token, user: { id: user.id, email: user.email, nombre: user.nombre, empresa_id: user.empresa_id, rol: 'admin' } });
  },

  async 'POST /api/login-cedula'(req, res) {
    const { cedula } = await getBody(req);
    if (!cedula) return sendJson(res, 400, { error: 'Cédula requerida' });
    const cleanCedula = String(cedula).trim();
    const { data: user } = await supabase.from('usuarios').select('*').eq('cedula', cleanCedula).maybeSingle();
    if (!user) return sendJson(res, 401, { error: 'Cédula no registrada en el sistema' });
    const { data: emp } = await supabase.from('empleados').select('id, email, empresa_id, apellido').eq('cedula', cleanCedula).maybeSingle();
    const token = signToken({
      id: user.id, cedula: user.cedula, nombre: user.nombre,
      email: emp?.email || null, empresa_id: emp?.empresa_id || user.empresa_id,
      rol: user.rol, empleado_id: emp?.id || null, apellido: emp?.apellido || null
    });
    sendJson(res, 200, {
      token,
      user: { id: user.id, cedula: user.cedula, nombre: user.nombre, apellido: emp?.apellido || null, email: emp?.email || null, empresa_id: emp?.empresa_id || user.empresa_id, rol: user.rol, empleado_id: emp?.id || null }
    });
  },

  'GET /api/me'(req, res) {
    const { id, email, nombre, empresa_id, rol, cedula, apellido, empleado_id } = req.user;
    sendJson(res, 200, { id, email, nombre, empresa_id, rol: rol || 'admin', cedula: cedula || null, apellido: apellido || null, empleado_id: empleado_id || null });
  },

  /* ──── EMPLEADOS ──── */

  'GET /api/empleados'(req, res) {
    return (async () => {
      const { data, error } = await supabase.from('empleados').select('*').order('apellido');
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  'GET /api/empleados/:id'(req, res, match) {
    return (async () => {
      const { data, error } = await supabase.from('empleados').select('*').eq('id', match[1]).single();
      if (error) return sendJson(res, error.code === 'PGRST116' ? 404 : 500, { error: error.message });
      sendJson(res, 200, data);
    })();
  },

  async 'POST /api/empleados'(req, res) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    body.empresa_id = req.user.empresa_id || body.empresa_id;
    const { data, error } = await supabase.from('empleados').insert(body).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  async 'PATCH /api/empleados/:id'(req, res, match) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    const { data, error } = await supabase.from('empleados').update(body).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  'DELETE /api/empleados/:id'(req, res, match) {
    return (async () => {
      if (!requireRole('admin')(req, res)) return;
      const { error } = await supabase.from('empleados').delete().eq('id', match[1]);
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 204, {});
    })();
  },

  /* ──── DOCUMENTOS ──── */

  'GET /api/documentos'(req, res) {
    return (async () => {
      const empleado_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('empleado_id'));
      let query = supabase.from('documentos').select('*');
      if (empleado_id) query = query.eq('empleado_id', empleado_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/documentos'(req, res) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    body.empresa_id = req.user.empresa_id || body.empresa_id;
    const { data, error } = await supabase.from('documentos').insert(body).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  'DELETE /api/documentos/:id'(req, res, match) {
    if (!requireRole('admin')(req, res)) return;
    return (async () => {
      const { data: doc } = await supabase.from('documentos').select('url').eq('id', match[1]).maybeSingle();
      const { error } = await supabase.from('documentos').delete().eq('id', match[1]);
      if (error) return sendJson(res, 500, { error: error.message });
      if (doc?.url) {
        try {
          const u = new URL(doc.url);
          const bucketPath = u.pathname.split('/object/public/expedientes/')[1];
          if (bucketPath) await supabase.storage.from('expedientes').remove([bucketPath]);
        } catch (_) {}
      }
      sendJson(res, 204, {});
    })();
  },

  /* ──── UPLOAD (multipart) ──── */

  async 'POST /api/upload'(req, res) {
    if (!requireRole('admin')(req, res)) return;
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return sendJson(res, 400, { error: 'Se requiere multipart/form-data' });
    }

    const busboy = Busboy({ headers: req, limits: { fileSize: 10 * 1024 * 1024 } });
    const fields = {};
    let fileBuffer = null;
    let fileName = '';
    let fileMime = '';

    busboy.on('field', (name, val) => { fields[name] = val; });

    busboy.on('file', (name, stream, info) => {
      fileName = info.filename || 'archivo';
      fileMime = info.mimeType || 'application/octet-stream';
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => { fileBuffer = Buffer.concat(chunks); });
    });

    busboy.on('finish', async () => {
      try {
        if (!fileBuffer) return sendJson(res, 400, { error: 'No se envió ningún archivo' });
        const empleadoId = fields.empleado_id;
        const tipo = fields.tipo || 'otros';
        if (!empleadoId) return sendJson(res, 400, { error: 'empleado_id requerido' });

        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `${empleadoId}/${tipo}/${Date.now()}-${safeName}`;

        const { error: uploadErr } = await supabase.storage
          .from('expedientes')
          .upload(storagePath, fileBuffer, { contentType: fileMime, upsert: false });

        if (uploadErr) return sendJson(res, 500, { error: 'Error subiendo archivo: ' + uploadErr.message });

        const { data: urlData } = supabase.storage.from('expedientes').getPublicUrl(storagePath);
        const publicUrl = urlData?.publicUrl;

        const docRecord = {
          empleado_id: parseInt(empleadoId),
          tipo,
          nombre_archivo: fileName,
          url: publicUrl || storagePath,
          fecha_subida: new Date().toISOString(),
          fecha_vencimiento: fields.fecha_vencimiento || null
        };
        const { data: doc, error: dbErr } = await supabase.from('documentos').insert(docRecord).select().single();
        if (dbErr) return sendJson(res, 500, { error: 'Error guardando registro: ' + dbErr.message });

        sendJson(res, 201, doc);
      } catch (err) {
        sendJson(res, 500, { error: err.message });
      }
    });

    req.pipe(busboy);
  },

  /* ──── VACACIONES ──── */

  'GET /api/vacaciones'(req, res) {
    return (async () => {
      const empleado_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('empleado_id'));
      let query = supabase.from('vacaciones').select('*');
      if (empleado_id) query = query.eq('empleado_id', empleado_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/vacaciones'(req, res) {
    const body = await getBody(req);
    body.empresa_id = req.user.empresa_id || body.empresa_id;
    const allowed = ['empleado_id', 'empresa_id', 'fecha_solicitud', 'fecha_inicio', 'fecha_fin', 'dias_solicitados', 'dias_disponibles', 'estatus', 'aprobado_por'];
    const safeBody = {};
    for (const k of allowed) { if (body[k] !== undefined) safeBody[k] = body[k]; }
    const { data, error } = await supabase.from('vacaciones').insert(safeBody).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  /* ──── VACACIONES HISTORIAL ──── */

  'GET /api/vacaciones-historial'(req, res) {
    return (async () => {
      const empleado_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('empleado_id'));
      let query = supabase.from('vacaciones_historial').select('*');
      if (empleado_id) query = query.eq('empleado_id', empleado_id);
      query = query.order('empleado_id');
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'PATCH /api/vacaciones-historial/:id'(req, res, match) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    const { data, error } = await supabase.from('vacaciones_historial').update(body).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  async 'POST /api/vacaciones-historial/batch'(req, res) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    if (!Array.isArray(body.updates)) return sendJson(res, 400, { error: 'updates array required' });
    const results = [];
    for (const u of body.updates) {
      const { id, ...fields } = u;
      const { data, error } = await supabase.from('vacaciones_historial').update(fields).eq('id', id).select().single();
      if (error) return sendJson(res, 500, { error: `id ${id}: ${error.message}` });
      results.push(data);
    }
    sendJson(res, 200, results);
  },

  async 'PATCH /api/vacaciones/:id'(req, res, match) {
    if (!requireRole('admin', 'gerente')(req, res)) return;
    const body = await getBody(req);

    if (body.estatus === 'aprobado_jefe') {
      body.aprobado_por_jefe = req.user.id;
      body.fecha_aprobacion_jefe = new Date().toISOString();
    } else if (body.estatus === 'aprobado') {
      body.aprobado_por_rrhh = req.user.id;
      body.fecha_aprobacion_rrhh = new Date().toISOString();
    }

    const { data, error } = await supabase.from('vacaciones').update(body).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  /* ──── CONSTANCIAS ──── */

  'GET /api/constancias'(req, res) {
    return (async () => {
      const empleado_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('empleado_id'));
      let query = supabase.from('constancias').select('*');
      if (empleado_id) query = query.eq('empleado_id', empleado_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/constancias'(req, res) {
    if (!requireRole('admin', 'empleado', 'gerente')(req, res)) return;
    const body = await getBody(req);
    body.empresa_id = req.user.empresa_id || body.empresa_id;
    const { data, error } = await supabase.from('constancias').insert(body).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  async 'PATCH /api/constancias/:id'(req, res, match) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    const { data, error } = await supabase.from('constancias').update(body).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  /* ──── FIDEICOMISO: APORTES ──── */

  'GET /api/fideicomiso/aportes'(req, res) {
    return (async () => {
      const empleado_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('empleado_id'));
      let query = supabase.from('fideicomiso_aportes').select('*').order('anio', { ascending: false }).order('trimestre');
      if (empleado_id) query = query.eq('empleado_id', empleado_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/fideicomiso/aportes'(req, res) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    const { empleado_id, trimestre, anio, monto } = body;
    if (!empleado_id || !trimestre || !anio) return sendJson(res, 400, { error: 'empleado_id, trimestre y anio requeridos' });
    const { data, error } = await supabase.from('fideicomiso_aportes')
      .upsert({ empleado_id, trimestre, anio, monto: monto || 0 }, { onConflict: 'empleado_id,trimestre,anio' })
      .select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  async 'POST /api/fideicomiso/aportes/batch'(req, res) {
    if (!requireRole('admin')(req, res)) return;
    const { aportes } = await getBody(req);
    if (!Array.isArray(aportes) || aportes.length === 0) return sendJson(res, 400, { error: 'Array de aportes requerido' });
    const results = [];
    for (const apt of aportes) {
      const { empleado_id, trimestre, anio, monto } = apt;
      if (!empleado_id || !trimestre || !anio) continue;
      const { data, error } = await supabase.from('fideicomiso_aportes')
        .upsert({ empleado_id, trimestre, anio, monto: monto || 0 }, { onConflict: 'empleado_id,trimestre,anio' })
        .select().single();
      if (!error && data) results.push(data);
    }
    sendJson(res, 201, results);
  },

  /* ──── FIDEICOMISO: SOLICITUDES ──── */

  'GET /api/fideicomiso/solicitudes'(req, res) {
    return (async () => {
      const empleado_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('empleado_id'));
      let query = supabase.from('fideicomiso_solicitudes').select('*').order('created_at', { ascending: false });
      if (empleado_id) query = query.eq('empleado_id', empleado_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/fideicomiso/solicitudes'(req, res) {
    const body = await getBody(req);
    body.empleado_id = body.empleado_id || req.user.empleado_id;
    if (!body.monto_solicitado) return sendJson(res, 400, { error: 'monto_solicitado requerido' });
    const { data, error } = await supabase.from('fideicomiso_solicitudes').insert({
      empleado_id: body.empleado_id,
      monto_solicitado: body.monto_solicitado,
      motivo: body.motivo || null,
      estado: 'pendiente'
    }).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  async 'PATCH /api/fideicomiso/solicitudes/:id'(req, res, match) {
    if (!requireRole('admin')(req, res)) return;
    const body = await getBody(req);
    const updateData = {};
    if (body.estado) updateData.estado = body.estado;
    if (body.notas_admin !== undefined) updateData.notas_admin = body.notas_admin;
    if (body.estado === 'aprobada' || body.estado === 'rechazada') updateData.processed_at = new Date().toISOString();
    const { data, error } = await supabase.from('fideicomiso_solicitudes').update(updateData).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  /* ──── AUDITORÍA: EMPRESAS ──── */

  'GET /api/empresas'(req, res) {
    return (async () => {
      const { data, error } = await supabase.from('empresas').select('*');
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  /* ──── AUDITORÍA: REQUISITOS ──── */

  'GET /api/requisitos'(req, res) {
    return (async () => {
      const { data, error } = await supabase.from('requisitos').select('*, modulos(*)').order('modulo_id');
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  /* ──── AUDITORÍA: AUDITORÍAS ──── */

  'GET /api/auditorias'(req, res) {
    return (async () => {
      const { data, error } = await supabase.from('auditorias').select('*').eq('usuario_id', req.user.id).order('id', { ascending: false });
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/auditorias'(req, res) {
    const body = await getBody(req);
    const { data, error } = await supabase.from('auditorias').insert({
      empresa_id: body.empresa_id || req.user.empresa_id,
      usuario_id: req.user.id,
      nombre: body.nombre || 'Auditoría Inicial'
    }).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  'GET /api/auditorias/:id'(req, res, match) {
    return (async () => {
      const { data, error } = await supabase.from('auditorias').select('*').eq('id', match[1]).single();
      if (error) return sendJson(res, error.code === 'PGRST116' ? 404 : 500, { error: error.message });
      sendJson(res, 200, data);
    })();
  },

  async 'PATCH /api/auditorias/:id'(req, res, match) {
    const body = await getBody(req);
    const { data, error } = await supabase.from('auditorias').update(body).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  'DELETE /api/auditorias/:id'(req, res, match) {
    return (async () => {
      const { error } = await supabase.from('auditorias').delete().eq('id', match[1]);
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 204, {});
    })();
  },

  /* ──── AUDITORÍA: RESPUESTAS ──── */

  'GET /api/respuestas'(req, res) {
    return (async () => {
      const auditoria_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('auditoria_id'));
      let query = supabase.from('respuestas').select('*');
      if (auditoria_id) query = query.eq('auditoria_id', auditoria_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/respuestas'(req, res) {
    const body = await getBody(req);
    const { data, error } = await supabase.from('respuestas').insert(body).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  async 'PATCH /api/respuestas/:id'(req, res, match) {
    const body = await getBody(req);
    body.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('respuestas').update(body).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  async 'PUT /api/respuestas/upsert'(req, res) {
    const { auditoria_id, requisito_codigo, ...fields } = await getBody(req);
    if (!auditoria_id || !requisito_codigo) return sendJson(res, 400, { error: 'auditoria_id y requisito_codigo requeridos' });
    fields.updated_at = new Date().toISOString();
    const { data, error } = await supabase.from('respuestas').upsert(
      { auditoria_id, requisito_codigo, ...fields },
      { onConflict: 'auditoria_id,requisito_codigo' }
    ).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  /* ──── AUDITORÍA: EVIDENCIAS ──── */

  async 'POST /api/evidencias'(req, res) {
    const body = await getBody(req);
    const { data, error } = await supabase.from('evidencias').insert(body).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  /* ──── AUDITORÍA: PLAN DE ACCIÓN ──── */

  'GET /api/plan-accion'(req, res) {
    return (async () => {
      const auditoria_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('auditoria_id'));
      let query = supabase.from('plan_accion').select('*');
      if (auditoria_id) query = query.eq('auditoria_id', auditoria_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  },

  async 'POST /api/plan-accion'(req, res) {
    const body = await getBody(req);
    const { data, error } = await supabase.from('plan_accion').insert(body).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  async 'PATCH /api/plan-accion/:id'(req, res, match) {
    const body = await getBody(req);
    const { data, error } = await supabase.from('plan_accion').update(body).eq('id', match[1]).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 200, data);
  },

  /* ──── AUDITORÍA: INFORMES ──── */

  async 'POST /api/informes'(req, res) {
    const body = await getBody(req);
    if (!body.auditoria_id || !body.contenido) return sendJson(res, 400, { error: 'auditoria_id y contenido requeridos' });
    const { data, error } = await supabase.from('informes').insert(body).select().single();
    if (error) return sendJson(res, 500, { error: error.message });
    sendJson(res, 201, data);
  },

  'GET /api/informes'(req, res) {
    return (async () => {
      const auditoria_id = parseInt(new URL(req.url, `http://localhost:${PORT}`).searchParams.get('auditoria_id'));
      let query = supabase.from('informes').select('*').order('id', { ascending: false });
      if (auditoria_id) query = query.eq('auditoria_id', auditoria_id);
      const { data, error } = await query;
      if (error) return sendJson(res, 500, { error: error.message });
      sendJson(res, 200, data || []);
    })();
  }
};

/* ════════════════════════════════════════════════════════════
   ROUTE DISPATCHER
   ════════════════════════════════════════════════════════════ */

function matchRoute(method, url) {
  const u = new URL(url, `http://localhost:${PORT}`);
  const pathname = u.pathname;

  if (method === 'POST' && pathname === '/api/register') return API_ROUTES['POST /api/register'];
  if (method === 'POST' && pathname === '/api/login') return API_ROUTES['POST /api/login'];

  for (const [key, handler] of Object.entries(API_ROUTES)) {
    const [m, route] = key.split(' ');
    if (m !== method) continue;
    if (route === pathname) return handler;
    const pattern = route.replace(/:id/g, '(\\d+)').replace(/:([^/]+)/g, '([^/]+)');
    const re = new RegExp(`^${pattern}$`);
    const match = pathname.match(re);
    if (match) {
      return (req, res) => handler(req, res, match);
    }
  }
  return null;
}

/* ════════════════════════════════════════════════════════════
   SERVER
   ════════════════════════════════════════════════════════════ */

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const url = req.url;

  if (req.method === 'POST' && url.startsWith('/v1/chat/completions')) {
    return proxyToNVIDIA(req, res);
  }

  const handler = matchRoute(req.method, url);
  if (handler) {
    if (url.startsWith('/api/') && !url.startsWith('/api/register') && !url.startsWith('/api/login')) {
      if (!authMiddleware(req, res)) return;
    }
    Promise.resolve(handler(req, res)).catch(err => {
      console.error(`[Server Error] ${req.method} ${req.url}:`, err.message);
      if (!res.headersSent) sendJson(res, 500, { error: err.message });
    });
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`\n  🚀 Servidor: http://localhost:${PORT}`);
  console.log(`  📁 Sirviendo: ${__dirname}`);
  console.log(`  🔐 API Auth: /api/register, /api/login, /api/me`);
  console.log(`  👥 API RRHH: /api/empleados, /api/documentos, /api/vacaciones, /api/constancias`);
  console.log(`  📋 API Auditoría: /api/auditorias, /api/respuestas, /api/plan-accion, /api/informes\n`);
});
