const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
app.listen(3000, () => console.log("Server is running..."));

const uri =
  "mongodb+srv://cmps415_02:admin123@krmdb.pzseua4.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

/*  default route */
app.get("/", (req, res) => {
  res.send("This is the home directory...");
});

/* #1 get request for grabbing all tickets */
app.get("/rest/list", async (req, res) => {
  try {
    //connect
    await client.connect();

    /*** make db calls ***/

    await allTickets(client);
  } catch (e) {
    console.error(e);
  } finally {
    //close the connection to mongo cluster
    await client.close();
  }

  async function allTickets(client, {} = {}) {
    // const cursor = client.db("krmdb").collection("tickets").find({}).toArray;
    const result = await client
      .db("krmdb")
      .collection("tickets")
      .find()
      .toArray();

    if (result) {
      // console.log(`Found a listing in the db with the id '${ticketId}'`);
      console.log(result);
      res.send(result);
    } else {
      // console.log(`No listing found with the id '${ticketId}'`);
      console.log(`There are no tickets in this collection.`);
    }
  }
});

/* #2 get request for grabbing ticket by id */
app.get("/rest/ticket/:id", async (req, res) => {
  try {
    //connect
    await client.connect();

    /*** make db calls ***/

    //get ticket by id
    await getTicketById(client);
  } catch (e) {
    console.error(e);
  } finally {
    //close the connection to mongo cluster
    await client.close();
  }

  async function getTicketById(client) {
    const result = await client
      .db("krmdb")
      .collection("tickets")
      .findOne({
        _id: Number(req.params.id),
      });

    if (result) {
      console.log(`Found a listing in the db with the id '${req.params.id}}'`);
      console.log(result);
      res.send(result);
    } else {
      console.log(`No listing found with the id '${req.params.id}'`);
    }
  }
});

/* #3 post request for creating a ticket */
app.get("/Post", function (req, res) {
  res.sendFile(__dirname + "/form.html");
});

/*** CREATE TICKET***/
app.get("/rest/createTicket", async (req, res) => {
  try {
    await client.connect();

    /*** make db calls ***/
    // create a single new listing
    await createTicket(client, {
      _id: 0,
      type: "void",
      subject: "elements",
      description: "nothingness",
      priority: "high",
      status: "closed",
      date: new Date(),
    });
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  async function createTicket(client, newTicket) {
    const result = await client
      .db("krmdb")
      .collection("tickets")
      .insertOne(newTicket);
    console.log(
      `New listing created with the following id: ${result.insertedId}`
    );
    res.send(`New listing created with the following id: ${result.insertedId}`);
  }
});

/* #4 delete request for removing a ticket */
app.get("/rest/deleteTicket/:id", async (req, res) => {
  try {
    //connect
    await client.connect();

    /*** make db calls ***/

    //get ticket by id
    await ticketExists(client); //check for ticket
    await deleteTicketById(client); //delete ticket
    await ticketExists(client); //check if deleted
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  // delete ticket
  async function deleteTicketById(client) {
    const result = await client
      .db("krmdb")
      .collection("tickets")
      .deleteOne({ _id: Number(req.params.id) });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
    res.send(`${result.deletedCount} document(s) was/were deleted.`);
  }

  // print ticket if it exists
  async function ticketExists(client) {
    const result = await client
      .db("krmdb")
      .collection("tickets")
      .findOne({ _id: Number(req.params.id) });

    if (result) {
      console.log(
        `Found a ticket in the collection with the id '${req.params.id}'.`
      );
    } else {
      console.log(`No ticket was found with the id '${req.params.id}'`);
    }
  }
});

/* #5 put request for updating a ticket */
app.get("/rest/updateTicket", function (req, res) {
  res.sendFile(__dirname + "/updateForm.html");
});

/*** UPDATE TICKET  ***/
app.get("/rest/update/:id", async (req, res) => {
  try {
    //connect
    await client.connect();

    /*** make db calls ***/

    await findTicketById(client);
    // update items on ticket
    await updateTicketById(client, {
      description: "it worked",
      status: "not available",
      type: "green",
      date: new Date(),
    });
    //print updated ticket
    await findTicketById(client);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

  // update ticket by given id
  async function updateTicketById(client, updatedTicket) {
    const result = await client
      .db("krmdb")
      .collection("tickets")
      .updateOne({ _id: Number(req.params.id) }, { $set: updatedTicket });

    console.log(
      `${result.matchedCount}} document(s) matched the query criteria.`
    );
    console.log(`${result.modifiedCount} document(s) was/were updated.`);
  }

  // get ticket by given id
  async function findTicketById(client) {
    const result = await client
      .db("krmdb")
      .collection("tickets")
      .findOne({ _id: Number(req.params.id) });

    if (result) {
      console.log(`Found a ticket in the db with the name '${req.params.id}':`);
      console.log(result);
      res.send(result);
    } else {
      console.log(`No ticket found with the id '${req.params.id}'`);
    }
  }
});
