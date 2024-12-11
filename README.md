# REPLASTE - C242-PS448

## Table of Contents

1. [Team C242-PS448 - CC](#Team-C242-PS448---CC)
2. [What is REPLASTE?](#REPLASTE)
3. [Technology](#Technology)
4. [Deployment](#Deployment)
5. [API Endpoints](#API-Endpoints)


## Team C242-PS448 - CC

| Bangkit ID | Name | Learning Path | University |LinkedIn |
| ---      | ---       | ---       | ---       | ---       |
| C488B4KY0483 | Anantha Marcellino Hidayat | Cloud Computing | Universitas Darma Persada | [![text](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](www.linkedin.com/in/ananthamarcellino/) |
| C001B4KX0664 | Arneleonita Putri Arinto | Cloud Computing |	Institut Pertanian Bogor  | [![text](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/arneleonita/) |

## REPLASTE

this application can detect and classify various plastic waste items using computer vision and a Convolutional Neural Network (CNN) model. By integrating this AI-powered recognition capability into the app, we can offer users real-time guidance on the appropriate recycling or disposal methods for each type of plastic. This will empower individuals to make more informed decisions and develop sustainable waste management habits.

## Technology
The REPLASTE project is built using the following technologies:

Node.js    : A JavaScript runtime built on Chrome's V8 JavaScript engine.
MySQL      : A relational database management system.
JWT        : JSON Web Tokens for Authentication.

## Deployment
### 1. Create the Database
After creating the database, run the following command:
```
gcloud sql instances patch (your database name) --authorized-networks=
```

### 2. Create the Bucket
Create a public bucket:
```
gsutil iam ch allUsers:objectViewer gs://YOUR_BUCKET_NAME
```

### 3. Create the Service Account
Assign the roles: Storage Admin and Storage Object Viewer.

### 4. Access MySQL
Access MySQL with the following command:
```
mysql -u root -p -h (your database IP)
```

### 5. Create Database in MySQL
Execute the following commands inside MySQL:
```
CREATE DATABASE replaste;
USE replaste;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE hasil_prediksi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    jenis_plastik VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE jenis_plastik (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(10) NOT NULL,
    deskripsi TEXT NOT NULL,
    recycling_time VARCHAR(100) NOT NULL,
    produk_penggunaan TEXT NOT NULL,
    environmental_impact TEXT NOT NULL,
    image_url VARCHAR(255),
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE recycling_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    gmaps_link TEXT NOT NULL,
    image_url VARCHAR(255),
    file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6. Deploy the Application to GCP
Navigate to the replaste folder, then run:
```
gcloud builds submit --tag gcr.io/my-firstproject-441503/replaste #replace replaste with your folder name
```

### 7. Deploy to Cloud Run
Deploy the application using the following command:
```
gcloud run deploy replaste \
--image gcr.io/replaste-442106/replaste \
--platform managed \
--region asia-southeast2 \
--allow-unauthenticated \
--set-env-vars="\
DB_HOST=34.101.154.43,\
DB_USER=root,\
DB_PASS=HoloSabaID@120303,\
DB_NAME=replaste,\
JWT_SECRET=b7d7e1f0a2c4e6g8i0k2m4o6q8s0u2w4y6a8c0e2g4i6k8m0,\
EMAIL_HOST=smtp.gmail.com,\
EMAIL_PORT=587,\
EMAIL_USER=replaste2@gmail.com,\
EMAIL_PASS=hkqy fsjh ukus zpwa,\
GOOGLE_CLOUD_PROJECT=replaste-442106,\
GOOGLE_CLOUD_BUCKET=replaste_bucket1,\
GOOGLE_CLOUD_KEYFILE=./key.json" \
--timeout=300
```

### 8. Test Using Postman
Login, Register, Reset Password:

- POST: https://replaste-1036434457572.asia-southeast2.run.app/login
Body (raw):
```
{
  "email": "masbro.am88@gmail.com",
  "password": "ubahpassword"
}
```

- POST: https://replaste-1036434457572.asia-southeast2.run.app/register
Body (raw):
```
{
  "email": "masbro.am88@gmail.com",
  "password": "ubahpassword",
  "full_name": "123"
}
```

-POST: https://replaste-1036434457572.asia-southeast2.run.app/request-reset
Body (raw):
```
{
  "email": "masbro.am88@gmail.com"
}
```

- POST: https://replaste-1036434457572.asia-southeast2.run.app/reset/{token}
Body (raw):
```
{
  "password": "123"
}
```

#### Call Prediction Results:
- GET: https://replaste-1036434457572.asia-southeast2.run.app/predictions/1

#### Classify Plastic Type:
- POST: https://plastic-classifier-1036434457572.asia-southeast2.run.app/predict
Body (form-data):
  - file: image
  - user_id: user_id

#### Save and Retrieve Plastic Types:

- GET: https://replaste-1036434457572.asia-southeast2.run.app/getAllPlastik

- GET: https://replaste-1036434457572.asia-southeast2.run.app/getPlastik/:id

- POST: https://replaste-1036434457572.asia-southeast2.run.app/createJenisPlastik

Body (raw JSON):
```
{
  "nama": "PET (Polyethylene Terephthalate)",
  "kode": "1",
  "deskripsi": "PET or PETE is the most common plastic used for food and beverage packaging. This plastic is clear, strong, lightweight, and impact-resistant.",
  "recycling_time": "450 years",
  "produk_penggunaan": "Mineral water bottles, soda bottles, cooking oil containers, chili sauce containers, jam containers, microwaveable packaging",
  "environmental_impact": "It can pollute the soil and water, potentially generating harmful microplastics for marine ecosystems. If burned, it can produce toxic gases."
}
```

- PUT: https://replaste-1036434457572.asia-southeast2.run.app/updateJenisPlastik/:id
Body (raw JSON):
```
{
  "nama": "PET (Polyethylene Terephthalate)",
  "kode": "1",
  "deskripsi": "PET or PETE is the most common plastic used for food and beverage packaging. This plastic is clear, strong, lightweight, and impact-resistant.",
  "recycling_time": "450 years",
  "produk_penggunaan": "Mineral water bottles, soda bottles, cooking oil containers, chili sauce containers, jam containers, microwaveable packaging",
  "environmental_impact": "It can pollute the soil and water, potentially generating harmful microplastics for marine ecosystems. If burned, it can produce toxic gases."
}
```

- DELETE: https://replaste-1036434457572.asia-southeast2.run.app/deleteJenisPlastik/:id

#### Save and Retrieve Recycling Locations:
- GET: https://replaste-1036434457572.asia-southeast2.run.app/getAllLokasi
- GET: https://replaste-1036434457572.asia-southeast2.run.app/getAllLokasi/:id
- POST: https://replaste-1036434457572.asia-southeast2.run.app/createLokasi
  - Body (form-data):
    - name: "Recycling Center Sejahtera"
    - address: "Jl. Raya No. 123, Jakarta"
    - phoneNumber: "081234567890"
    - gmapsLink: "https://goo.gl/maps/xxxxx"
    - image: [file]
- PUT: https://replaste-1036434457572.asia-southeast2.run.app/updateLokasi/:id
  - Body (form-data):
    - name: "Recycling Center Sejahtera"
    - address: "Jl. Raya No. 123, Jakarta"
    - phoneNumber: "081234567890"
    - gmapsLink: "https://goo.gl/maps/xxxxx"
    - image: [file]
- DELETE: https://replaste-1036434457572.asia-southeast2.run.app/deleteLokasi/:id

## API Endpoints

Here are the available API endpoints for the REPLASTE project:


