// Función para mostrar mensajes
function mostrarMensaje(elementId, mensaje, esError = false) {
  const elemento = document.getElementById(elementId);
  elemento.textContent = mensaje;
  elemento.style.color = esError ? 'red' : 'green';
}

// Cargar clientes
async function cargarCustomers() {
  try {
    const res = await fetch('/customers');
    const customers = await res.json();
    if (!res.ok) throw new Error(customers.error || 'Error al cargar clientes');

    // Llenar select para transacciones
    const selectCustomer = document.getElementById('customer_id');
    const selectCustomerActualizar = document.getElementById('customer_id-actualizar');
    selectCustomer.innerHTML = '<option value="">Selecciona un cliente</option>';
    selectCustomerActualizar.innerHTML = '<option value="">Selecciona un cliente</option>';
    customers.forEach(customer => {
      const option = document.createElement('option');
      option.value = customer.id_customer;
      option.textContent = `${customer.customer_name} (${customer.email})`;
      selectCustomer.appendChild(option.cloneNode(true));
      selectCustomerActualizar.appendChild(option);
    });

    // Mostrar tabla de clientes
    const listaCustomers = document.getElementById('lista-customers');
    listaCustomers.innerHTML = `
      <table>
        <tr><th>ID</th><th>Número Identificación</th><th>Nombre</th><th>Dirección</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr>
        ${customers.map(c => `
          <tr>
            <td>${c.id_customer}</td>
            <td>${c.identification_number}</td>
            <td>${c.customer_name}</td>
            <td>${c.address}</td>
            <td>${c.phone}</td>
            <td>${c.email}</td>
            <td>
              <button onclick="editarCustomer(${c.id_customer}, ${c.identification_number}, '${c.customer_name}', '${c.address}', ${c.phone}, '${c.email}')">Editar</button>
              <button class="delete" onclick="eliminarCustomer(${c.id_customer})">Eliminar</button>
            </td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (err) {
    mostrarMensaje('lista-customers', err.message, true);
  }
}

// Cargar transacciones
async function cargarTransactions() {
  try {
    const res = await fetch('/transactions');
    const transactions = await res.json();
    if (!res.ok) throw new Error(transactions.error || 'Error al cargar transacciones');

    // Llenar select para facturas
    const selectTransaction = document.getElementById('transaction_id');
    const selectTransactionActualizar = document.getElementById('transaction_id-actualizar');
    selectTransaction.innerHTML = '<option value="">Selecciona una transacción</option>';
    selectTransactionActualizar.innerHTML = '<option value="">Selecciona una transacción</option>';
    transactions.forEach(transaction => {
      const option = document.createElement('option');
      option.value = transaction.id_transaction;
      option.textContent = `Transacción ${transaction.id_transaction} (${transaction.transaction_type})`;
      selectTransaction.appendChild(option.cloneNode(true));
      selectTransactionActualizar.appendChild(option);
    });

    // Mostrar tabla de transacciones
    const listaTransactions = document.getElementById('lista-transactions');
    listaTransactions.innerHTML = `
      <table>
        <tr><th>ID</th><th>Cliente ID</th><th>Fecha y Hora</th><th>Monto</th><th>Estado</th><th>Tipo</th><th>Acciones</th></tr>
        ${transactions.map(t => `
          <tr>
            <td>${t.id_transaction}</td>
            <td>${t.customer_id}</td>
            <td>${new Date(t.date_and_time).toLocaleString()}</td>
            <td>${t.transaction_amount}</td>
            <td>${t.transaction_status}</td>
            <td>${t.transaction_type}</td>
            <td>
              <button onclick="editarTransaction(${t.id_transaction}, ${t.customer_id}, '${t.date_and_time}', ${t.transaction_amount}, '${t.transaction_status}', '${t.transaction_type}')">Editar</button>
              <button class="delete" onclick="eliminarTransaction(${t.id_transaction})">Eliminar</button>
            </td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (err) {
    mostrarMensaje('lista-transactions', err.message, true);
  }
}

// Cargar facturas
async function cargarInvoices() {
  try {
    const res = await fetch('/invoices');
    const invoices = await res.json();
    if (!res.ok) throw new Error(invoices.error || 'Error al cargar facturas');

    const listaInvoices = document.getElementById('lista-invoices');
    listaInvoices.innerHTML = `
      <table>
        <tr><th>ID</th><th>Plataforma</th><th>Número Factura</th><th>Transacción ID</th><th>Período</th><th>Monto Facturado</th><th>Monto Pagado</th><th>Acciones</th></tr>
        ${invoices.map(i => `
          <tr>
            <td>${i.id_invoice}</td>
            <td>${i.platform_used}</td>
            <td>${i.invoice_number}</td>
            <td>${i.transaction_id}</td>
            <td>${new Date(i.invoice_period).toLocaleDateString()}</td>
            <td>${i.invoiced_amount}</td>
            <td>${i.amount_paid}</td>
            <td>
              <button onclick="editarInvoice(${i.id_invoice}, '${i.platform_used}', '${i.invoice_number}', ${i.transaction_id}, '${i.invoice_period}', ${i.invoiced_amount}, ${i.amount_paid})">Editar</button>
              <button class="delete" onclick="eliminarInvoice(${i.id_invoice})">Eliminar</button>
            </td>
          </tr>
        `).join('')}
      </table>
    `;
  } catch (err) {
    mostrarMensaje('lista-invoices', err.message, true);
  }
}

// Crear cliente
document.getElementById('form-customer').addEventListener('submit', async (e) => {
  e.preventDefault();
  const identification_number = document.getElementById('identification_number').value;
  const customer_name = document.getElementById('customer_name').value;
  const address = document.getElementById('address').value;
  const phone = document.getElementById('phone').value;
  const email = document.getElementById('email').value;
  try {
    const res = await fetch('/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identification_number, customer_name, address, phone, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear cliente');
    mostrarMensaje('lista-customers', 'Cliente creado exitosamente');
    document.getElementById('form-customer').reset();
    cargarCustomers();
  } catch (err) {
    mostrarMensaje('lista-customers', err.message, true);
  }
});

// Editar cliente
function editarCustomer(id, identification_number, customer_name, address, phone, email) {
  const formActualizar = document.getElementById('form-actualizar-customer');
  document.getElementById('customer-id').value = id;
  document.getElementById('identification_number-actualizar').value = identification_number;
  document.getElementById('customer_name-actualizar').value = customer_name;
  document.getElementById('address-actualizar').value = address;
  document.getElementById('phone-actualizar').value = phone;
  document.getElementById('email-actualizar').value = email;
  formActualizar.style.display = 'block';
}

document.getElementById('form-actualizar-customer').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('customer-id').value;
  const identification_number = document.getElementById('identification_number-actualizar').value;
  const customer_name = document.getElementById('customer_name-actualizar').value;
  const address = document.getElementById('address-actualizar').value;
  const phone = document.getElementById('phone-actualizar').value;
  const email = document.getElementById('email-actualizar').value;
  const body = {};
  if (identification_number) body.identification_number = identification_number;
  if (customer_name) body.customer_name = customer_name;
  if (address) body.address = address;
  if (phone) body.phone = phone;
  if (email) body.email = email;

  try {
    const res = await fetch(`/customers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar cliente');
    mostrarMensaje('lista-customers', 'Cliente actualizado exitosamente');
    document.getElementById('form-actualizar-customer').style.display = 'none';
    document.getElementById('form-actualizar-customer').reset();
    cargarCustomers();
  } catch (err) {
    mostrarMensaje('lista-customers', err.message, true);
  }
});

// Eliminar cliente
async function eliminarCustomer(id) {
  if (!confirm('¿Seguro que quieres eliminar este cliente?')) return;
  try {
    const res = await fetch(`/customers/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar cliente');
    mostrarMensaje('lista-customers', 'Cliente eliminado exitosamente');
    cargarCustomers();
    cargarTransactions();
    cargarInvoices();
  } catch (err) {
    mostrarMensaje('lista-customers', err.message, true);
  }
}

// Crear transacción
document.getElementById('form-transaction').addEventListener('submit', async (e) => {
  e.preventDefault();
  const customer_id = document.getElementById('customer_id').value;
  const date_and_time = document.getElementById('date_and_time').value;
  const transaction_amount = document.getElementById('transaction_amount').value;
  const transaction_status = document.getElementById('transaction_status').value;
  const transaction_type = document.getElementById('transaction_type').value;
  try {
    const res = await fetch('/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id, date_and_time, transaction_amount, transaction_status, transaction_type })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear transacción');
    mostrarMensaje('lista-transactions', 'Transacción creada exitosamente');
    document.getElementById('form-transaction').reset();
    cargarTransactions();
  } catch (err) {
    mostrarMensaje('lista-transactions', err.message, true);
  }
});

// Editar transacción
function editarTransaction(id, customer_id, date_and_time, transaction_amount, transaction_status, transaction_type) {
  const formActualizar = document.getElementById('form-actualizar-transaction');
  document.getElementById('transaction-id').value = id;
  document.getElementById('customer_id-actualizar').value = customer_id;
  document.getElementById('date_and_time-actualizar').value = date_and_time.slice(0, 16);
  document.getElementById('transaction_amount-actualizar').value = transaction_amount;
  document.getElementById('transaction_status-actualizar').value = transaction_status;
  document.getElementById('transaction_type-actualizar').value = transaction_type;
  formActualizar.style.display = 'block';
}

document.getElementById('form-actualizar-transaction').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('transaction-id').value;
  const customer_id = document.getElementById('customer_id-actualizar').value;
  const date_and_time = document.getElementById('date_and_time-actualizar').value;
  const transaction_amount = document.getElementById('transaction_amount-actualizar').value;
  const transaction_status = document.getElementById('transaction_status-actualizar').value;
  const transaction_type = document.getElementById('transaction_type-actualizar').value;
  const body = {};
  if (customer_id) body.customer_id = customer_id;
  if (date_and_time) body.date_and_time = date_and_time;
  if (transaction_amount) body.transaction_amount = transaction_amount;
  if (transaction_status) body.transaction_status = transaction_status;
  if (transaction_type) body.transaction_type = transaction_type;

  try {
    const res = await fetch(`/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar transacción');
    mostrarMensaje('lista-transactions', 'Transacción actualizada exitosamente');
    document.getElementById('form-actualizar-transaction').style.display = 'none';
    document.getElementById('form-actualizar-transaction').reset();
    cargarTransactions();
  } catch (err) {
    mostrarMensaje('lista-transactions', err.message, true);
  }
});

// Eliminar transacción
async function eliminarTransaction(id) {
  if (!confirm('¿Seguro que quieres eliminar esta transacción?')) return;
  try {
    const res = await fetch(`/transactions/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar transacción');
    mostrarMensaje('lista-transactions', 'Transacción eliminada exitosamente');
    cargarTransactions();
    cargarInvoices();
  } catch (err) {
    mostrarMensaje('lista-transactions', err.message, true);
  }
}

// Crear factura
document.getElementById('form-invoice').addEventListener('submit', async (e) => {
  e.preventDefault();
  const platform_used = document.getElementById('platform_used').value;
  const invoice_number = document.getElementById('invoice_number').value;
  const transaction_id = document.getElementById('transaction_id').value;
  const invoice_period = document.getElementById('invoice_period').value;
  const invoiced_amount = document.getElementById('invoiced_amount').value;
  const amount_paid = document.getElementById('amount_paid').value;
  try {
    const res = await fetch('/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_used, invoice_number, transaction_id, invoice_period, invoiced_amount, amount_paid })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear factura');
    mostrarMensaje('lista-invoices', 'Factura creada exitosamente');
    document.getElementById('form-invoice').reset();
    cargarInvoices();
  } catch (err) {
    mostrarMensaje('lista-invoices', err.message, true);
  }
});

// Editar factura
function editarInvoice(id, platform_used, invoice_number, transaction_id, invoice_period, invoiced_amount, amount_paid) {
  const formActualizar = document.getElementById('form-actualizar-invoice');
  document.getElementById('invoice-id').value = id;
  document.getElementById('platform_used-actualizar').value = platform_used;
  document.getElementById('invoice_number-actualizar').value = invoice_number;
  document.getElementById('transaction_id-actualizar').value = transaction_id;
  document.getElementById('invoice_period-actualizar').value = invoice_period;
  document.getElementById('invoiced_amount-actualizar').value = invoiced_amount;
  document.getElementById('amount_paid-actualizar').value = amount_paid;
  formActualizar.style.display = 'block';
}

document.getElementById('form-actualizar-invoice').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('invoice-id').value;
  const platform_used = document.getElementById('platform_used-actualizar').value;
  const invoice_number = document.getElementById('invoice_number-actualizar').value;
  const transaction_id = document.getElementById('transaction_id-actualizar').value;
  const invoice_period = document.getElementById('invoice_period-actualizar').value;
  const invoiced_amount = document.getElementById('invoiced_amount-actualizar').value;
  const amount_paid = document.getElementById('amount_paid-actualizar').value;
  const body = {};
  if (platform_used) body.platform_used = platform_used;
  if (invoice_number) body.invoice_number = invoice_number;
  if (transaction_id) body.transaction_id = transaction_id;
  if (invoice_period) body.invoice_period = invoice_period;
  if (invoiced_amount) body.invoiced_amount = invoiced_amount;
  if (amount_paid) body.amount_paid = amount_paid;

  try {
    const res = await fetch(`/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar factura');
    mostrarMensaje('lista-invoices', 'Factura actualizada exitosamente');
    document.getElementById('form-actualizar-invoice').style.display = 'none';
    document.getElementById('form-actualizar-invoice').reset();
    cargarInvoices();
  } catch (err) {
    mostrarMensaje('lista-invoices', err.message, true);
  }
});

// Eliminar factura
async function eliminarInvoice(id) {
  if (!confirm('¿Seguro que quieres eliminar esta factura?')) return;
  try {
    const res = await fetch(`/invoices/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar factura');
    mostrarMensaje('lista-invoices', 'Factura eliminada exitosamente');
    cargarInvoices();
  } catch (err) {
    mostrarMensaje('lista-invoices', err.message, true);
  }
}

// Subir CSVs
document.getElementById('form-csv').addEventListener('submit', async (e) => {
  e.preventDefault();
  const tabla = document.getElementById('tabla').value;
  const mapeo = document.getElementById('mapeo').value;
  const archivos = document.getElementById('csvFiles').files;
  if (archivos.length === 0) {
    mostrarMensaje('resultado-csv', 'Debes seleccionar al menos un archivo CSV', true);
    return;
  }

  const formData = new FormData();
  for (const archivo of archivos) {
    formData.append('csvFiles', archivo);
  }
  formData.append('tabla', tabla);
  if (mapeo) formData.append('mapeo', mapeo);

  try {
    const res = await fetch('/subir-csvs', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir CSVs');
    mostrarMensaje('resultado-csv', `Carga completada: ${data.insertados} registros insertados${data.errores ? '\nErrores: ' + data.errores.join('; ') : ''}`);
    cargarCustomers();
    cargarTransactions();
    cargarInvoices();
  } catch (err) {
    mostrarMensaje('resultado-csv', err.message, true);
  }
});

cargarCustomers();
cargarTransactions();
cargarInvoices();