const tf = require('@tensorflow/tfjs-node');;
const mobilenet = require('@tensorflow-models/mobilenet');
const image = require('get-image-data');
const fs = require('fs');
var multer = require('multer');
var multerS3 = require('multer-s3');
var sizeOf = require('image-size');
const path = require('path');


var cors = require('cors');
var bodyParser = require('body-parser');

var express = require('express');
// Get keys from .env
const { S3_ACCESS_ID, S3_SECRET_ACCESS_KEY, MONGO_ADMIN_PASSWORD, MONGO_DBNAME, MONGO_ADMIN_USER } = require('./config')

var aws = require('aws-sdk')
//Setup mongo
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://mongo-admin:${MONGO_ADMIN_PASSWORD}@cluster0.ltwaf.mongodb.net/${MONGO_DBNAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri);


const PORT = process.env.PORT || 5000;


async function mongoDB_insert(file, dims, predictions) {
    try {
        // Connect to DB
        await client.connect();
        console.log("Connected correctly to server");

        const db = client.db(MONGO_DBNAME);
        const col = db.collection("images");
        // Create image documents from uploaded files
        let imageDocuments = 
            { name: file['originalname'], 
              url: `https://shopify-image-repo-leungjch.s3.amazonaws.com/${file['originalname']}`, 
              width: dims['width'], 
              height: dims['height'],
              prediction: predictions[0]['className'],
              probability: predictions[0]['probability']
            }

        // Insert into DB
        const p = await col.insertOne(imageDocuments);
        // const myDoc = await col.findOne();
        // console.log(myDoc);
    } catch (err) {
        console.log("MONGODB INSERT ERROR", err);
    }
    // finally {
    //     await client.close();
    // }
}

async function mongoDB_fetchImages() {
    try {
        // Connect to DB
        await client.connect();
        console.log("Connected correctly to server");

        const db = client.db(MONGO_DBNAME);
        const col = db.collection("images");
        const images = await col.find().toArray(function (err, items) {
            console.log(items);
            return callback(items);
        });
        return images
    } catch (err) {
        console.log(err.stack);
    }
    // finally {
    //     await client.close();
    // }
}


var app = express();
app.use(express.static('public'));
app.use(cors())
// For parsing json requests
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images');         // store in /images folder
    },
    filename: (req, file, callback) => {
        callback(null, 'test-image.jpg'); // store current image as test-image.jpg
    },
});
const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(new Error('You can upload only image files'), false);
    }
    callback(null, true);
};
const upload = multer({ storage, fileFilter: imageFileFilter });

var s3 = new aws.S3({
    secretAccessKey: S3_SECRET_ACCESS_KEY,
    accessKeyId: S3_ACCESS_ID,
    region: 'us-east-1'
}
);


async function load(img) {
    // Load the model.
    const model = await mobilenet.load();

    // Classify the image.
    const predictions = await model.classify(img);

    console.log('Predictions: ');
    console.log(predictions);
    return predictions
}


// POST endpoint
// Upload images to S3 and add entry to MongoDB
app.post('/upload', upload.single('upl'), async function (req, res, next) {

    const imagePath = './images/test-image.jpg';

    let img = req.file

    var dims = sizeOf(imagePath);
    console.log(dims)

    // Perform inference using mobilenet
    image(imagePath, async function (errImage, imageForMobilenet) {
        const numChannels = 3;
        const numPixels = imageForMobilenet.width * imageForMobilenet.height;
        const values = new Int32Array(numPixels * numChannels);
        var pixels = imageForMobilenet.data
        for (let i = 0; i < numPixels; i++) {
            for (let channel = 0; channel < numChannels; ++channel) {
                values[i * numChannels + channel] = pixels[i * 4 + channel];
            }
        }
        const outShape = [imageForMobilenet.height, imageForMobilenet.width, numChannels];
        const input = tf.tensor3d(values, outShape, 'int32');
        var predictions = await load(input)

        // Prepare upload data to S3
        const params = {
            Bucket: 'shopify-image-repo-leungjch',
            Key: img.originalname,
            Body: fs.readFileSync(imagePath),
            ContentType: img.mimetype,
            ACL: 'public-read'
        }

        // Upload to S3
        s3.upload(params, async (err_s3, data) => {
            try {
                if (err_s3) {
                    console.log("ERROR UPLOADING TO S3:", err_s3)
                } else {
                    // Add all info to database after store picture to S3
                    console.log("Successfully added mongodb")
                    mongoDB_insert(req.file, dims, predictions).catch(console.dir);
                }
            }
            catch (err_s3) {
                console.log("ERROR UPLOADING TO S3:", err_s3)
            }
        });
        res.redirect('/');

    });

});

// GET endpoint
// Fetch image data from MongoDB
app.get('/get_images', function (req, res) {
    MongoClient.connect(uri, function (err, db) {
        if (err) throw err;
        var dbo = db.db(MONGO_DBNAME);

        
        dbo.collection("images").find({}).toArray(function(err, result) {
                if (err) throw err;
                console.log("Successfully GET images", result)
                res.json(result);
                db.close();
            });
    });
})

// For production build on heroku
if (process.env.NODE_ENV === 'production') {
    // Exprees will serve up production assets
    app.use(express.static('client/build'));
  }
  

app.listen(PORT, function () {
    console.log(`App running on port ${PORT}`);
});
