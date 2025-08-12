Initialize the project: npm init -y
Install the necessary dependencies: npm install express mysql2 dotenv multer csv-parser

Add the connection details to a new .env file.
DB_HOST=localhost
DB_USER=root # Your MySQL username
DB_PASSWORD=your-password
DB_NAME=database name
PORT=3000

Run script.sql in MySQL (with Workbench, or mysql -u root -p < script.sql) before starting the server.

Start the server: node app.js

Open http://localhost:3000 in your browser.

Now, Customers, Transactions, Invoices will appear. Here you can add Customers, Transactions, and Invoices. There is also a section to upload a CSV file.
To upload the CSV file, choose which table the data will go to. Then, add the mapping and upload the CSV file. Click the button and the data will be uploaded.

The technologies used were HTML, CSS and JavaScript.

These are the mappings

{ "Nombre del Cliente": "customer_name", "Número de Identificación": "identification_number", "Dirección": "address", "Teléfono": "phone", "Correo Electrónico": "email" }

{ "Plataforma Utilizada": "platform_used", "Número de Factura": "invoice_number", "Periodo de Facturación": "invoice_period", "Monto Facturado": "invoiced_amount", "Monto Pagado": "amount_paid", "transaction_id": "transaction_id" } 

{ "ID de la Transacción": "id_transaction", "Fecha y Hora de la Transacción": "date_and_time", "Monto de la Transacción": "transaction_amount", "Estado de la Transacción": "transaction_status", "Tipo de Transacción": "transaction_type", "customer_id": "customer_id" }








