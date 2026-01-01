# ✍️ Create an AMI - Deploy application using an AMI and setting up auto scalling group for scalling.  
For simplicity, there is only one image is created for the backed and frontend however it is recommondaed to create separate images for backend and frondend.   

### 1. First provision AWS EC2 isntance (EC2 medium with 20 GB LBS) and install all the runtimes.  
sudo apt update && sudo apt install -y mysql-server  
sudo systemctl start mysql  
sudo systemctl enable mysql 

### 2. Clone the code on EC2 and deploy  
git clone https://github.com/surendra-dire/quote-app-3.git    

**BACKEND**:   
1. Create database credentials in AWS Secrets Manager.    
2. Create shell script that will fatch the database credentials and available them via env variables (initialize_variables.sh).  
3. Create a jar file. mvn clean isntall   
4. Create systemd service where call the initialize_variables.sh and run the backend.  
5. Create systemd service (quote_systemd.service). This will be executed as soon as image is deployed or machine is rebooted.
6. Create the image and save it. 

**FRONTEND**:

### 2. Provision another AWS EC2 isntance (EC2 medium with 20 GB LBS) on which AMI will be deployed.
**SETUP DATABASE**:  
sudo apt update && sudo apt install -y \

sudo apt install -y mysql-server  
sudo systemctl start mysql  
sudo systemctl enable mysql  

### Root password setup
Switch MySQL from "system-login" to "password-login" (setting the password to root) so your Spring Boot app can connect. FLUSH PRIVILEGES saves these changes, and EXIT closes the database prompt  

sudo mysql  
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';  
FLUSH PRIVILEGES;  
EXIT;  

### Create database and tables  
mysql -u root -p  
CREATE DATABASE quotes_app;  
USE quotes_app;  

-- Create Users Table  
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100),
    password VARCHAR(100)
);

-- Create Quotes Table  
CREATE TABLE quotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255),
    author VARCHAR(255),
    user_id BIGINT,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert Initial Data  
INSERT INTO users (username, name, password) VALUES ('test', 'test', 'test');  
INSERT INTO quotes (text, author, user_id) VALUES ('The only way to do great work is to love what you do.', 'Steve Jobs', 1);  

# 🚀 **Getting started**

**Deploy Locally:** 

Permissions  
Ensure the current user owns the project directory so you don't run into "Permission Denied" errors:  
sudo chown -R $USER:$USER /home/ubuntu/quote-app 

Navigate to your backend and run:  
mvn clean install  
mvn spring-boot:run  

Verify user can be created :  

✅ Register a user  
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123","name":"Test User"}'

🧪 Login Test  
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"123"}'

Add Quote for user ID = 1  
curl http://localhost:8080/api/quotes/1  

curl -X POST http://localhost:8080/api/quotes/1 \
  -H "Content-Type: application/json" \
  -d '{"text":"Stay hungry, stay foolish","author":"Steve Jobs"}'  

  
🚀 Summary
Action	URL
Register user	POST /api/auth/register
Login user	    POST /api/auth/login
Get quotes	    GET /api/quotes/{userId}
Add quote	    POST /api/quotes/{userId}
Update quote	PUT /api/quotes/{id}
Delete quote	DELETE /api/quotes/{id}


Navigate to your frontend directory and run:  
npm install  
npm start  

**Deploy in Porduction:**  

**Backend Deployment:**    
A shell script (start.sh) is used to securely initialize backend configuration by fetching database credentials from AWS Secrets Manager. The script parses the secret JSON using jq, sets the required Spring Boot environment variables, and starts the application JAR.

sudo apt install -y jq
mvn clean install
sudo vi start.sh  

<pre style="color: orange;">
#!/bin/bash

echo "Fetching secrets from AWS..."
# Fetching the JSON
RAW_SECRETS=$(aws secretsmanager get-secret-value --secret-id prod/quotes/db --query SecretString --output text)

# Parsing individual keys
export SPRING_DATASOURCE_URL=$(echo $RAW_SECRETS | jq -r .url)
export SPRING_DATASOURCE_USERNAME=$(echo $RAW_SECRETS | jq -r .username)
export SPRING_DATASOURCE_PASSWORD=$(echo $RAW_SECRETS | jq -r .password)

echo "Starting Application..."
java -jar target/quotes-0.0.1-SNAPSHOT.jar

</pre>  

chmod +x start.sh  
 
Verify manaully:  
./start.sh 

RAW_SECRETS=$(aws secretsmanager get-secret-value --secret-id prod/quotes/db --query SecretString --output text)  

MY_USER=$(aws secretsmanager get-secret-value --secret-id prod/quotes/db --query SecretString --output text | jq -r .username)  
echo $MY_USER  

**Frontend Deployment:**   
Install Nginx, move your build folder to /var/www/html, and restart the Nginx service to host the site.  

sudo apt install -y nginx  
systemctl start nginx  
systemctl enable nginx   

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



### Troubleshoot commands:   
sudo ufw allow 8080  
sudo netstat -tulpn | grep 8080  
sudo systemctl status mysql  
sudo kill -9 $(sudo lsof -t -i:8080) or sudo ss -lptn 'sport = :8080'  

