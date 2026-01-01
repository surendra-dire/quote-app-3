# ✍️ Create an AMI - Deploy application using an AMI and setting up auto scalling group for scalling.  
For simplicity, there is only one image is created for the backed and frontend however it is recommondaed to create separate images for backend and frondend.   

### 1. Prepare Database server first
Provision a separate AWS EC2 isntance and install and configure the MySQL database.

**SETUP DATABASE**:  
sudo apt update  
sudo apt install -y mysql-server  
sudo systemctl start mysql  
sudo systemctl enable mysql  

Root password setup   
Switch MySQL from "system-login" to "password-login" (setting the password to root) so your Spring Boot app can connect. FLUSH PRIVILEGES saves these changes, and EXIT closes the database prompt  

sudo mysql  
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';  
FLUSH PRIVILEGES;  
EXIT;  

Create database and tables  
mysql -u root -p  
CREATE DATABASE quotes_app;  
USE quotes_app;  

#Create Users Table  
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    password VARCHAR(100)
);

#Create Quotes Table  
CREATE TABLE quotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255),
    author VARCHAR(255),
    user_id BIGINT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

#Insert Initial Data if needed for testing.   
INSERT INTO users (username, name, password) VALUES ('test', 'Surendra', 'test');  
INSERT INTO quotes (text, author, user_id) VALUES ('The only way to do great work is to love what you do.', 'Steve Jobs', 1); 

sudo systemctl restart mysql  
sudo systemctl enable mysql 

### 2. Clone the code on another EC2 instance and deploy the application. 
git clone https://github.com/surendra-dire/quote-app-3.git    

**BACKEND**:   
1. Create database credentials in AWS Secrets Manager.    
2. Create shell script that will fatch the database credentials and available them via env variables (initialize_variables.sh).  
3. Create a jar file. mvn clean isntall   
4. Create systemd service where call the initialize_variables.sh and run the backend.  
5. Create systemd service (quote_systemd.service). This will be executed as soon as image is deployed or machine is rebooted.
6. Create the image and save it. 

**FRONTEND**:
Create build and configure nginx   

npm run build  
sudo mkdir /var/www/react/  
sudo cp -r build/* /var/www/react/  

configure nginx conf file:  /etc/nginx/sites-available/default   

<pre style="color: orange;">
server {
    listen 80;
    server_name 54.167.50.249;  # Replace with your server IP or domain

    root /var/www/react;            # React build files
    index index.html;

    # Serve React SPA routes
    location / {
        try_files $uri /index.html;
    }

    # Proxy all API requests to Spring Boot backend
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Optional: increase timeout for long-running requests
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    # Optional: handle 404 for React SPA
    error_page 404 /index.html;
}
</pre>
    
sudo nginx -t  
sudo systemctl restart nginx   
sudo systemctl enable nginx   


