# ✍️ Provision an AMI  and scalling using scalling group    

Deploy application using an AMI and setting up auto scalling group for scalling.      
For simplicity, there is only one image is created for the backeed and frontend however it is recommondaed to create separate images for backend and frondend.     

### 1. Prepare Database server first  
Provision a separate AWS EC2 isntance and install and configure the MySQL database.    

**SETUP DATABASE**:  
sudo apt update  
sudo apt install -y mysql-server  
sudo systemctl start mysql  
sudo systemctl enable mysql  

**Enable Remote Access**:  
sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf  
bind-address = 0.0.0.0  
sudo systemctl restart mysql  

**Create DB + User**:  
Create a dedicated DB user (admin) for the application and allow remote access.   
#Switch MySQL from "system-login" to "password-login" (setting the password to root) so your Spring Boot app can connect. FLUSH PRIVILEGES saves these changes, and EXIT closes the database prompt.  

sudo mysql  
CREATE DATABASE quotes_app; 

CREATE USER 'admin'@'%' IDENTIFIED WITH mysql_native_password BY 'admin';
GRANT ALL PRIVILEGES ON quotes_app.* TO 'admin'@'%';
FLUSH PRIVILEGES;
EXIT;  

mysql -u admin -p  
SELECT user, host FROM mysql.user WHERE user='admin';  

**Create database, tables & data**:  
mysql -u admin -p  
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
EXIT;

sudo systemctl restart mysql  
sudo systemctl enable mysql 

**Open port 3306**: 
 Update security group.  

### 2. Clone the code on another EC2 instance and deploy the application. 
git clone https://github.com/surendra-dire/quote-app-3.git    

**BACKEND**:     

1. Install tools and runtime for backend  
sudo apt update  
sudo apt install -y \    
  openjdk-17-jdk \  
  maven \  
  nodejs \  
  npm \  
  nginx \
  jq  \
  unzip  \

sudo systemctl restart nginx    
sudo systemctl enable nginx 

2. Install AWS cli  
sudo curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"  
sudo apt update && sudo apt install -y unzip && unzip awscliv2.zip  
sudo ./aws/install  
  
3. Create database credentials in AWS Secrets Manager.  
   prod/quotes/db   
{  
  "username": "admin",          
  "password": "admin",          
  "url": "jdbc:mysql://<DB_PRIVATE_IP>:3306/quotes_app"  
}  
 

4. Create S3 bucket to upload backened jar.  
   s3-bucket-backend-jar  
   
5. Create Jar and upload into S3 bucket  
   mvn clean package  
   aws s3 cp target/quotes-0.0.1-SNAPSHOT.jar s3://s3-bucket-backend-jar/quotes-0.0.1-SNAPSHOT.jar

6. Create IAM role to access db credentials from secret manager and download the .jar from the s3 bciket.
   EC2-SecretManager_S3_Role  
   Attach role to the EC2 machine where app is deployed.
<pre style="color: orange;">
   {
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:prod/quotes/db*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::s3-bucket-backend-jar/*"
    }
  ]
}
</pre>  

7.Create app directory  
sudo mkdir -p /opt/quotes  
sudo chown ubuntu:ubuntu /opt/quotes  

8.Create shell script that will fatch the database credentials and available them via env variables (load-secrets.sh).  
sudo vi /opt/quotes/load-secrets.sh   

<pre style="color: orange;">
#!/bin/bash
set -e  
echo "Fetching secrets from AWS"   
# Fetching the JSON  
RAW_SECRETS=$(aws secretsmanager get-secret-value --secret-id prod/quotes/db --query SecretString --output text)  

# Parsing individual keys  
export SPRING_DATASOURCE_URL=$(echo "$RAW_SECRETS" | jq -r .url)
export SPRING_DATASOURCE_USERNAME=$(echo "$RAW_SECRETS" | jq -r .username)
export SPRING_DATASOURCE_PASSWORD=$(echo "$RAW_SECRETS" | jq -r .password) 
</pre>  

chmod +x /opt/quotes/load-secrets.sh  

9.Backend startup script
sudo vi /opt/quotes/start-backend.sh

<pre style="color: orange;">  
#!/bin/bash
set -e
source /opt/quotes/load-secrets.sh  
aws s3 cp s3://s3-bucket-backend-jar/quotes-0.0.1-SNAPSHOT.jar /opt/quotes/quotes-0.0.1-SNAPSHOT.jar  
exec java -jar /opt/quotes/quotes-0.0.1-SNAPSHOT.jar  
</pre>  

chmod +x /opt/quotes/start-backend.sh

10. Configure systemd service  
sudo vi /etc/systemd/system/quotes.service  

<pre style="color: orange;">
[Unit]
Description=Quotes Application
After=network.target

[Service]
ExecStart=/opt/quotes/start-backend.sh
Restart=always
User=ubuntu
Environment=JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

[Install]
WantedBy=multi-user.target
</pre> 

sudo chown -R ubuntu:ubuntu /opt/quotes  
sudo chmod +x /opt/quotes/start-backend.sh  
sudo chmod +x /opt/quotes/load-secrets.sh  

Run:  
<pre style="color: orange;">
sudo systemctl daemon-reload  
sudo systemctl enable quotes  
sudo systemctl start quotes  
</pre>

Check logs:  
journalctl -u quotes -f  





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


