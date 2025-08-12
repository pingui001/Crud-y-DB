CREATE DATABASE pd_nicolas_porras_gosling;

USE pd_nicolas_porras_gosling;

CREATE TABLE customers (
    id_customer INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    identification_number INT UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    address VARCHAR(100) NOT NULL,
    phone INT NOT NULL,
    email VARCHAR(100) NOT NULL
);

ALTER TABLE customers MODIFY phone VARCHAR(50) NOT NULL;


CREATE TABLE transactions (
    id_transaction INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    customer_id INT, 
    date_and_time DATETIME NOT NULL,
    transaction_amount INT NOT NULL,
    transaction_status VARCHAR(50) NOT NULL,
    transaction_type VARCHAR(70) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id_customer) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE invoices (
    id_invoice INT AUTO_INCREMENT PRIMARY KEY UNIQUE,
    platform_used VARCHAR(50) NOT NULL,
    invoice_number VARCHAR(70) NOT NULL,
    transaction_id INT, 
    invoice_period DATE NOT NULL,
    invoiced_amount INT NOT NULL,
    amount_paid INT NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id_transaction) ON DELETE CASCADE ON UPDATE CASCADE
);

	
SELECT * FROM customers;
SELECT * FROM transactions;
SELECT * FROM invoices;
