var ENV = require('./config/config');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');
var NodeGeocoder = require('node-geocoder');

const app = express();


var options = {
    provider: 'google',
    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: ENV.MY_API_KEY, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

app.use(cors({ origin: ENV.FRONTEND_IP, credentials: true }));
//Allow Access Control
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', ENV.FRONTEND_IP);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

var location = {};
address = ""
found = 0;

app.get('/getLocation', (req, res) => {
    console.log("Inside Get Location Route");
    firstName = req.query.firstName || "";
    lastName = req.query.lastName || "";
    console.log("firstName lastname", firstName, lastName)

    var file = fs.createReadStream(ENV.FILE_LOCATION)
        .pipe(csv())
        .on('data', async function (chunk) {
            try {
                //console.log(chunk.Physician_First_Name,chunk.Physician_Last_Name,firstName,lastName)
                //console.log("data will be read in chunks by createReadStream, this executes after every chunk of data");
                if (chunk.Physician_First_Name.toLowerCase() == firstName.toLowerCase() && chunk.Physician_Last_Name.toLowerCase() == lastName.toLowerCase()) {
                    console.log(chunk.Physician_First_Name.toLowerCase(), chunk.Physician_Last_Name.toLowerCase(), firstName, lastName)
                    address = chunk.Recipient_Primary_Business_Street_Address_Line1 + " " + chunk.Recipient_City + " " + chunk.Recipient_State + " " + chunk.Recipient_Zip_Code + " " + chunk.Recipient_Country
                    //console.log("record found, stopping processing")
                    found = 1
                    file.end();
                }
            }
            catch (err) {
                //error handler
                //res.writeHead(400, { 'Content-Type': 'text/plain' });
                //res.end("Error reading file");
                console.log("error reading the file", err);
            }
        })
        .on('end', async function () {
            //some final operation
            if (found) {
                await getLocationCoordinates(address);
                console.log("location co-ordinates updated", location)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(location));
                location = {}
                firstName = ""
                lastName = ""
                found = 0
                console.log("response sent");
            } else {
                console.log("No address found")
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end("user location not found");
            }
        });
});

getLocationCoordinates = async (address) => {
    //console.log("Inside getLocation Coordinates")
    console.log("address received:", address)
    await geocoder.geocode(address, function (err, res) {
        if (err) {
            console.log(err)
        }
        location["latitude"] = res[0].latitude;
        location["longitude"] = res[0].longitude;
    });
    console.log("location coordinates retrieved : ", location)
}

app.listen(ENV.PORT, () => console.log(`Server listening on port `+ENV.PORT));