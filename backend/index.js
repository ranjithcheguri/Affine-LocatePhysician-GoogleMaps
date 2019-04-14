const port = process.env.PORT || 3001;
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');


const app = express();
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'google',
    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: 'AIzaSyBamxibIuV-M2NYIV1bQI1DClCiWp0VTqs', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

var location = {};
address = ""

app.get('/getLocation', (req, res) => {
    //console.log("Inside Get Location Route");
    firstName = req.query.firstName || "";
    lastName = req.query.lastName || "";
    //console.log("firstName", firstName, lastName)

    var file = fs.createReadStream('C:/Users/theev/Downloads/PGYR16_P011819/OP_DTL_OWNRSHP_PGYR2016_P01182019.csv')
        .pipe(csv())
        .on('data', async function (chunk) {
            try {
                //console.log("data will be read in chunks by createReadStream, this executes after every chunk of data")
                //console.log(JSON.stringify(chunk.Physician_First_Name), firstName)
                //console.log(JSON.stringify(chunk.Physician_Last_Name), lastName)
                if (JSON.stringify(chunk.Physician_First_Name) == firstName && JSON.stringify(chunk.Physician_Last_Name) == lastName) {
                    address = chunk.Recipient_Primary_Business_Street_Address_Line1 + " " + chunk.Recipient_City + " " + chunk.Recipient_State + " " + chunk.Recipient_Zip_Code + " " + chunk.Recipient_Country
                    console.log("record found, stopping processing")
                    //console.log("Address Found :", address)
                    file.end();
                }
            }
            catch (err) {
                //error handler
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end("user location not found");
                console.log("error reading the file", err);
            }
        })
        .on('end', async function () {
            //some final operation
            if (address) {
                await getLocationCoordinates(address);
                console.log("location co-ordinates updated",location)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(location));
                console.log("response sent");
            } else {
                console.log("No address found")
                res.writeHead(400,{ 'Content-Type': 'test/plain' });
                res.end("user location not found");
            }
        });



});

getLocationCoordinates = async(address) => {
    console.log("Inside getLocation Coordinates")
    console.log("address received:",address)
    await geocoder.geocode(address, function (err, res) {
        if (err) {
            console.log(err)
        }
        location["latitude"] = res[0].latitude;
        location["longitude"] = res[0].longitude;
    });
    console.log("location coordinates retrieved : ", location)
}

app.listen(3001, () => console.log(`Server listening on port 3001`));