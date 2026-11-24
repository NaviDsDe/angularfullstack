const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

function readDb() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { categories: [], products: [], siteInfo: {}, homeData: {}, users: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname.replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const db = readDb();
  console.log(`[${new Date().toLocaleTimeString()}] ${method} ${pathname}`);

  if (pathname === '/' && method === 'GET') {
    return sendJson(res, 200, {
      name: 'E-Shop REST API Server',
      status: 'online',
      endpoints: [
        'GET /siteInfo',
        'GET /homeData',
        'GET /categories',
        'GET /products',
        'GET /products/:id',
        'POST /products',
        'DELETE /products/:id',
        'GET /users',
        'POST /login'
      ]
    });
  }

  if (pathname === '/siteInfo' && method === 'GET') {
    return sendJson(res, 200, db.siteInfo || {});
  }

  if (pathname === '/homeData' && method === 'GET') {
    return sendJson(res, 200, db.homeData || {});
  }

  if (pathname === '/categories' && method === 'GET') {
    return sendJson(res, 200, db.categories || []);
  }

  if (pathname === '/products' && method === 'GET') {
    let products = db.products || [];

    if (parsedUrl.query.categoryId) {
      const catId = parseInt(parsedUrl.query.categoryId, 10);
      products = products.filter((p) => p.categoryId === catId);
    }

    if (parsedUrl.query.q) {
      const q = parsedUrl.query.q.toLowerCase().trim();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)
      );
    }

    const limit = parseInt(parsedUrl.query._limit || parsedUrl.query.limit, 10);
    const page = parseInt(parsedUrl.query._page || parsedUrl.query.page || 1, 10);

    if (limit && limit > 0) {
      const start = (page - 1) * limit;
      products = products.slice(start, start + limit);
    }

    return sendJson(res, 200, products);
  }

  if (pathname.startsWith('/products/') && method === 'GET') {
    const id = parseInt(pathname.split('/')[2], 10);
    const product = (db.products || []).find((p) => p.id === id);
    if (!product) return sendJson(res, 404, { error: 'Product not found' });
    return sendJson(res, 200, product);
  }

  if (pathname === '/products' && method === 'POST') {
    const body = await parseBody(req);
    const newProduct = {
      id: db.products.length ? Math.max(...db.products.map((p) => p.id)) + 1 : 1,
      name: body.name || 'New Product',
      image: body.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
      color: body.color || 'Standard',
      price: Number(body.price) || 99,
      currency: body.currency || 'USD',
      releaseDate: body.releaseDate || new Date().toISOString(),
      categoryId: Number(body.categoryId) || 1,
      rating: Number(body.rating) || 5,
    };
    db.products.push(newProduct);
    writeDb(db);
    return sendJson(res, 201, newProduct);
  }

  if (pathname.startsWith('/products/') && method === 'DELETE') {
    const id = parseInt(pathname.split('/')[2], 10);
    const index = (db.products || []).findIndex((p) => p.id === id);
    if (index === -1) return sendJson(res, 404, { error: 'Product not found' });
    db.products.splice(index, 1);
    writeDb(db);
    return sendJson(res, 200, { success: true, message: `Product ${id} deleted` });
  }

  if (pathname === '/users' && method === 'GET') {
    const safeUsers = (db.users || []).map(({ password, ...rest }) => rest);
    return sendJson(res, 200, safeUsers);
  }

  if (pathname === '/login' && method === 'POST') {
    const body = await parseBody(req);
    const { email, password } = body;
    const user = (db.users || []).find((u) => u.email === email && u.password === password);

    if (!user) {
      return sendJson(res, 401, { error: 'Invalid email or password' });
    }

    const { password: _, ...safeUser } = user;
    return sendJson(res, 200, {
      user: safeUser,
      token: 'jwt-token-sample-' + Date.now(),
      message: 'Login successful'
    });
  }

  return sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 E-Shop Server running at http://localhost:${PORT}`);
  console.log(`===============================================`);
});
