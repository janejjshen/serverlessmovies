"use strict";

var AWS = require("aws-sdk");

AWS.config.update({
    region: "us-east-1"
});

var docClient = new AWS.DynamoDB.DocumentClient();
var tableName = process.env.TABLE_NAME;

/*
 * Reads one movie item from the database. 
 * Expects "year" and "title" to be provided in the query string.
 */
exports.read = function (event, context, callback) {
    console.log("Read event: " + JSON.stringify(event));
    var year, title;

    if (event["queryStringParameters"] !== null && event["queryStringParameters"] !== undefined) {
        year = event["queryStringParameters"]['year'];
        title = event["queryStringParameters"]['title'];
    }

    if (!validateKeys(year, title, callback)) {
        return;
    }

    var params = {
        TableName: tableName,
        Key: {
            "year": parseInt(year),
            "title": title
        }
    };

    docClient.get(params, function (err, data) {
        if (err) {
            errorCallback("Unable to read item. Error JSON:" + JSON.stringify(err, null, 2), 500, callback);
        } else {
            successCallback("GetItem succeeded:", data, 200, callback);
        }
    });
}

/*
* Creates one movie in the database. 
* Required input: year and title of the movie. Optionally "info" can be provided as well.
*/
exports.create = function (event, context, callback) {
    console.log("Create event: " + JSON.stringify(event));

    var requestBody = JSON.parse(event.body);
    if (!validateRequest(requestBody, callback)) {
        return;
    }

    var year = requestBody.year;
    var title = requestBody.title;
    var info = requestBody.info;

    var params = {
        TableName: tableName,
        Item: {
            "year": parseInt(year),
            "title": title   
        }
    };

    if (info !== null && info !== undefined) {
        params.Item.info = info;
    }

    console.log("Adding a new movie item...");
    docClient.put(params, function (err, data) {
        if (err) {
            errorCallback("Unable to add item. Error JSON:" + JSON.stringify(err, null, 2), 500, callback);
        } else {
            successCallback("Added movie:", data, 201, callback);
        }

    });
}

/*
* Updates an existing movie in the database. 
* Required year and title to be provided as search keys. 
*/
exports.update = function (event, context, callback) {
    console.log("Update event: " + JSON.stringify(event));

    var requestBody = JSON.parse(event.body);
    if (!validateRequest(requestBody, callback)) {
        return;
    }

    var year = requestBody.year;
    var title = requestBody.title;
    var info = requestBody.info;

    // If info is not provided, clear out the attribute.
    if (info === null || info === undefined) {
        info = {};
    }

    var params = {
        TableName: tableName,
        Key: {
            "year": parseInt(year),
            "title": title
        },
        UpdateExpression: 'set #a = :x',
        ExpressionAttributeNames: { '#a': 'info' },
        ExpressionAttributeValues: {
            ':x': info
        },
        ReturnValues: "UPDATED_NEW"
    };

    console.log("Updating a movie...");
    docClient.update(params, function (err, data) {
        if (err) {
            errorCallback("Unable to update item. Error JSON:" + JSON.stringify(err, null, 2), 500, callback);
        } else {
            successCallback("Updated item:", data, 200, callback);
        }

    });
}

/*
* Deletes a movie from the database. 
* Require title and year to be provided as search keys.
*/
exports.delete = function (event, context, callback) {
    console.log("Delete event: " + JSON.stringify(event));

    var requestBody = JSON.parse(event.body);
    if (!validateRequest(requestBody, callback)) {
        return;
    }

    var year = requestBody.year;
    var title = requestBody.title;
    var info = requestBody.info;

    var params = {
        TableName: tableName,
        Key: {
            "year": parseInt(year),
            "title": title
        }
    };

    console.log("Deleting item...");
    docClient.delete(params, function (err, data) {
        if (err) {
            errorCallback("Unable to delete item. Error JSON:" + JSON.stringify(err, null, 2), 500, callback);
        } else {
            successCallback("Deleted item:", data, 200, callback);
        }

    });
}

// Validate the request body and keys, return an error if the body or proper keys are not provided.
function validateRequest(requestBody, callback) {
    if (requestBody === null || requestBody === undefined) {
        errorCallback("Request malformed: body element missing.", 400, callback);
        return false;
    }

    var year = requestBody.year;
    var title = requestBody.title;

    if (!validateKeys(year, title, callback)){
        return false;
    }

    return true;
}

//Validate the year and title keys and return an error if they aren't provided.
function validateKeys(year, title, callback) {
    if (year === null || year === undefined) {
        errorCallback("Please provide the year of the movie.", 400, callback);
        return false;
    }
    if (title === null || title === undefined) {
        errorCallback("Please provide the title of the movie.", 400, callback);
        return false;
    }

    return true;
}

// Provides an error callback to the API.
function errorCallback(message, statusCode, callback) {
    var error = {
        errorType: "InvalidRequest",
        errorMessage: message
    };

    var myErrorObj = {
        statusCode: statusCode,
        body: JSON.stringify(error)
    };

    console.log("Error: " + JSON.stringify(myErrorObj));
    callback(null, myErrorObj);
}

// Provides a successful callback to the API.
function successCallback(message, data, statusCode, callback) {
    console.log(message, JSON.stringify(data, null, 2));

     // Since we will be using Lambda proxy integration, the callback must follow this format.
    var response = {
        statusCode: statusCode,
        body: JSON.stringify(data)
    };

    console.log("response: " + JSON.stringify(response));
    callback(null, response);
}
