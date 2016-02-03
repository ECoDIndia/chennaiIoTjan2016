var iotf = require("ibmiotf");
var fs = require("fs");
//this is the configuration for this device.
var deviceClientConfig = {
  org: 'j82zgk',
  type: 'pi',
  id: 'pi1',
  "auth-method" : "token",
    "auth-token" : "qwertyu123"
};

var deviceClient = new iotf.IotfDevice(deviceClientConfig);

//setting the log level to trace. By default its 'warn'
deviceClient.log.setLevel('info');
//connecting to the IBM IoT
deviceClient.connect();

deviceClient.on('connect', function(){
        setInterval(function(){
                fs.readFile('/sys/class/thermal/thermal_zone0/temp', '', function (err,data) {
                  if (err) {
                        return console.log(err);
                  }
                  var event = {};
                  event.d = {};
                  event.d.temp = data/1000;
                  var eventStr = JSON.stringify(event);
                  console.log(eventStr);
                  deviceClient.publish('myevt', 'json', eventStr, 0);
                });
        }, 2000);

    //deviceClient.disconnect();
});

deviceClient.on('disconnect', function(){
  console.log('Disconnected from IoTF');
});

deviceClient.on("command", function (commandName,format,payload,topic) {
    if(commandName === "createfile") {
        console.log("command received for creating file : "+payload);
        var payJson = JSON.parse(payload);
        console.log("File Name is "+payJson.name+" with content ::  "+payJson.content);
      fs.writeFile(payJson.name, payJson.content, function (err) {
              if (err) throw err;
              console.log('Created File : '+payJson.name);
      });
    } else {
        console.log("Command not supported.. " + commandName);
    }
});