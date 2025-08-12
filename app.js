require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const upload = multer({ dest: 'uploads/' });

const handleError = (res, err, status = 500) => {
  console.error(err);
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
};

app.post('/customers', async (req, res) => {
  const { identification_number, customer_name, address, phone, email } = req.body;
  if (!identification_number || !customer_name || !address || !phone || !email) {
    return res.status(400).json({ error: 'Faltan campos requeridos: identification_number, customer_name, address, phone, email' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO customers (identification_number, customer_name, address, phone, email) VALUES (?, ?, ?, ?, ?)',
      [identification_number, customer_name, address, phone, email]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Cliente creado exitosamente' });
  } catch (err) {
    handleError(res, err, err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  }
});

app.get('/customers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM customers');
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM customers WHERE id_customer = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

app.put('/customers/:id', async (req, res) => {
  const { id } = req.params;
  const { identification_number, customer_name, address, phone, email } = req.body;
  if (!identification_number && !customer_name && !address && !phone && !email) {
    return res.status(400).json({ error: 'Al menos un campo debe ser proporcionado' });
  }
  try {
    const updates = [];
    const values = [];
    if (identification_number) { updates.push('identification_number = ?'); values.push(identification_number); }
    if (customer_name) { updates.push('customer_name = ?'); values.push(customer_name); }
    if (address) { updates.push('address = ?'); values.push(address); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (email) { updates.push('email = ?'); values.push(email); }
    values.push(id);

    const query = `UPDATE customers SET ${updates.join(', ')} WHERE id_customer = ?`;
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente actualizado exitosamente' });
  } catch (err) {
    handleError(res, err, err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  }
});

app.delete('/customers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM customers WHERE id_customer = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ mensaje: 'Cliente eliminado exitosamente' });
  } catch (err) {
    handleError(res, err);
  }
});

// CRUD para transactions
app.post('/transactions', async (req, res) => {
  const { customer_id, date_and_time, transaction_amount, transaction_status, transaction_type } = req.body;
  if (!customer_id || !date_and_time || !transaction_amount || !transaction_status || !transaction_type) {
    return res.status(400).json({ error: 'Faltan campos requeridos: customer_id, date_and_time, transaction_amount, transaction_status, transaction_type' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO transactions (customer_id, date_and_time, transaction_amount, transaction_status, transaction_type) VALUES (?, ?, ?, ?, ?)',
      [customer_id, date_and_time, transaction_amount, transaction_status, transaction_type]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Transacción creada exitosamente' });
  } catch (err) {
    handleError(res, err, err.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500);
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM transactions');
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM transactions WHERE id_transaction = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

app.put('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  const { customer_id, date_and_time, transaction_amount, transaction_status, transaction_type } = req.body;
  if (!customer_id && !date_and_time && !transaction_amount && !transaction_status && !transaction_type) {
    return res.status(400).json({ error: 'Al menos un campo debe ser proporcionado' });
  }
  try {
    const updates = [];
    const values = [];
    if (customer_id) { updates.push('customer_id = ?'); values.push(customer_id); }
    if (date_and_time) { updates.push('date_and_time = ?'); values.push(date_and_time); }
    if (transaction_amount) { updates.push('transaction_amount = ?'); values.push(transaction_amount); }
    if (transaction_status) { updates.push('transaction_status = ?'); values.push(transaction_status); }
    if (transaction_type) { updates.push('transaction_type = ?'); values.push(transaction_type); }
    values.push(id);

    const query = `UPDATE transactions SET ${updates.join(', ')} WHERE id_transaction = ?`;
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ mensaje: 'Transacción actualizada exitosamente' });
  } catch (err) {
    handleError(res, err, err.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500);
  }
});

app.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM transactions WHERE id_transaction = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ mensaje: 'Transacción eliminada exitosamente' });
  } catch (err) {
    handleError(res, err);
  }
});

// CRUD para invoices
app.post('/invoices', async (req, res) => {
  const { platform_used, invoice_number, transaction_id, invoice_period, invoiced_amount, amount_paid } = req.body;
  if (!platform_used || !invoice_number || !transaction_id || !invoice_period || !invoiced_amount || !amount_paid) {
    return res.status(400).json({ error: 'Faltan campos requeridos: platform_used, invoice_number, transaction_id, invoice_period, invoiced_amount, amount_paid' });
  }
  try {
    const [result] = await pool.execute(
      'INSERT INTO invoices (platform_used, invoice_number, transaction_id, invoice_period, invoiced_amount, amount_paid) VALUES (?, ?, ?, ?, ?, ?)',
      [platform_used, invoice_number, transaction_id, invoice_period, invoiced_amount, amount_paid]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Factura creada exitosamente' });
  } catch (err) {
    handleError(res, err, err.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500);
  }
});

app.get('/invoices', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM invoices');
    res.json(rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.get('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM invoices WHERE id_invoice = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

app.put('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  const { platform_used, invoice_number, transaction_id, invoice_period, invoiced_amount, amount_paid } = req.body;
  if (!platform_used && !invoice_number && !transaction_id && !invoice_period && !invoiced_amount && !amount_paid) {
    return res.status(400).json({ error: 'Al menos un campo debe ser proporcionado' });
  }
  try {
    const updates = [];
    const values = [];
    if (platform_used) { updates.push('platform_used = ?'); values.push(platform_used); }
    if (invoice_number) { updates.push('invoice_number = ?'); values.push(invoice_number); }
    if (transaction_id) { updates.push('transaction_id = ?'); values.push(transaction_id); }
    if (invoice_period) { updates.push('invoice_period = ?'); values.push(invoice_period); }
    if (invoiced_amount) { updates.push('invoiced_amount = ?'); values.push(invoiced_amount); }
    if (amount_paid) { updates.push('amount_paid = ?'); values.push(amount_paid); }
    values.push(id);

    const query = `UPDATE invoices SET ${updates.join(', ')} WHERE id_invoice = ?`;
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json({ mensaje: 'Factura actualizada exitosamente' });
  } catch (err) {
    handleError(res, err, err.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500);
  }
});

app.delete('/invoices/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute('DELETE FROM invoices WHERE id_invoice = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json({ mensaje: 'Factura eliminada exitosamente' });
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/subir-csvs', upload.array('csvFiles', 10), async (req, res) => { const archivos = req.files; const { tabla = 'customers', mapeo } = req.body; const mapeoObj = mapeo ? JSON.parse(mapeo) : {};

if (!archivos || archivos.length === 0) { return res.status(400).json({ error: 'Debes subir al menos un archivo CSV' }); }

const tablasPermitidas = ['customers', 'transactions', 'invoices']; if (!tablasPermitidas.includes(tabla)) { return res.status(400).json({ error: 'Tabla no válida' }); }

let totalInsertados = 0; let errores = [];

try { for (const archivo of archivos) { const pathArchivo = archivo.path; const datos = []; const columnasEsperadas = tabla === 'customers' ? ['identification_number', 'customer_name', 'address', 'phone', 'email'] : tabla === 'transactions' ? ['customer_id', 'date_and_time', 'transaction_amount', 'transaction_status', 'transaction_type'] : ['platform_used', 'invoice_number', 'transaction_id', 'invoice_period', 'invoiced_amount', 'amount_paid'];

  await new Promise((resolve, reject) => {
    fs.createReadStream(pathArchivo)
      .pipe(csv())
      .on('data', (row) => {
        const filaMapeada = {};
        for (const colTabla of columnasEsperadas) {
          const colCsv = Object.keys(mapeoObj).find(key => mapeoObj[key] === colTabla) || colTabla;
          if (row[colCsv]) {
            if (colTabla === 'date_and_time' && tabla === 'transactions') {
              filaMapeada[colTabla] = excelDateToMySQL(parseFloat(row[colCsv]));
            } else if (colTabla === 'invoice_period' && tabla === 'invoices') {
              const date = new Date(row[colCsv]);
              filaMapeada[colTabla] = isNaN(date) ? null : date.toISOString().slice(0, 10);
            } else if (colTabla === 'identification_number' || colTabla === 'transaction_amount' || 
                       colTabla === 'customer_id' || colTabla === 'transaction_id' || 
                       colTabla === 'invoiced_amount' || colTabla === 'amount_paid') {
              filaMapeada[colTabla] = parseInt(row[colCsv], 10);
            } else {
              filaMapeada[colTabla] = row[colCsv];
            }
          }
        }
        const requiredFields = tabla === 'customers'
          ? filaMapeada.identification_number && filaMapeada.customer_name && 
            filaMapeada.address && filaMapeada.phone && filaMapeada.email
          : tabla === 'transactions'
            ? filaMapeada.customer_id && filaMapeada.date_and_time && 
              filaMapeada.transaction_amount && filaMapeada.transaction_status && 
              filaMapeada.transaction_type
            : filaMapeada.platform_used && filaMapeada.invoice_number && 
              filaMapeada.transaction_id && filaMapeada.invoice_period && 
              filaMapeada.invoiced_amount && filaMapeada.amount_paid;
        if (requiredFields) {
          datos.push(tabla === 'customers'
            ? [filaMapeada.identification_number, filaMapeada.customer_name, 
               filaMapeada.address, filaMapeada.phone, filaMapeada.email]
            : tabla === 'transactions'
              ? [filaMapeada.customer_id, filaMapeada.date_and_time, 
                 filaMapeada.transaction_amount, filaMapeada.transaction_status, 
                 filaMapeada.transaction_type]
              : [filaMapeada.platform_used, filaMapeada.invoice_number, 
                 filaMapeada.transaction_id, filaMapeada.invoice_period, 
                 filaMapeada.invoiced_amount, filaMapeada.amount_paid]);
        } else {
          errores.push(`Fila inválida en ${archivo.originalname}: ${JSON.stringify(row)}`);
        }
      })
      .on('end', () => {
        fs.unlinkSync(pathArchivo);
        resolve();
      })
      .on('error', reject);
  });

  if (datos.length > 0) {
    const placeholders = datos.map(() => `(${columnasEsperadas.map(() => '?').join(', ')})`).join(', ');
    const valoresAplanados = datos.flat();
    try {
      const [result] = await pool.execute(
        `INSERT INTO ${tabla} (${columnasEsperadas.join(', ')}) VALUES ${placeholders}`,
        valoresAplanados
      );
      totalInsertados += result.affectedRows;
    } catch (err) {
      errores.push(`Error insertando desde ${archivo.originalname}: ${err.message}`);
    }
  }
}

res.json({
  mensaje: 'Subida y carga completada',
  insertados: totalInsertados,
  errores: errores.length > 0 ? errores : null
});

} catch (err) { archivos.forEach(archivo => fs.unlinkSync(archivo.path)); handleError(res, err); } });

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});