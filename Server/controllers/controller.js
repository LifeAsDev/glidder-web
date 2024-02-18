const mongoose = require("mongoose");
let UserDB = require("../models/model");

exports.create = (req, res) => {
  const user = new UserDB({
    active: "yes",
    status: "0",
  });

  user
    .save(user)
    .then((data) => {
      res.send(data._id);

      console.log("User created", user)
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error",
      });
    });
};

exports.leavingUserUpdate = (req, res) => {
  const userid = req.params.id;
  console.log("Leaving userid:", userid);

  UserDB.updateOne(
    { _id: userid },
    {
      $set: {
        active: "no",
        status: "0",
      },
    }
  )
    .then((data) => {
      if (!data || data.nModified === 0) {
        console.log("User removed");
        return res.status(404).send({
          message: `Cannot update user with ${userid} not found or no modifications were made`,
        });
      }
      res.send({ message: "1 document updated" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({ message: "Error updating user" });
    });
};


exports.newUserUpdate = (req, res) => {
  const userid = req.params.id;
  console.log("Revisited User", userid);

  UserDB.updateOne({ _id:userid }, { $set: { active: "yes" } })
    .then((data) => {
      if (!data || data.nModified === 0) {
        // Check if no document was modified
        return res.status(404).send({
          message: `Cannot update user with ${userid} not found or no modifications were made`,
        });
      }
      res.send({ message: "1 document updated" });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).send({ message: "Error updating user" });
    });
};

exports.updateOnEngagement = (req, res) => {
  const userid = req.params.id;
  console.log("Revisited User", userid);

  UserDB.updateOne({ _id:userid }, { $set: { status: "1" } })
    .then((data) => {
      if (!data || data.nModified === 0) {
        // Check if no document was modified
        return res.status(404).send({
          message: `Cannot update user with ${userid} not found or no modifications were made`,
        });
      }
      res.send({ message: "Update on Enganment" });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).send({ message: "Error updating user" });
    });
};


exports.updateOnNext = (req, res) => {
  const userid = req.params.id;
  console.log("Revisited User", userid);

  UserDB.updateOne({ _id:userid }, { $set: { status: "0" } })
    .then((data) => {
      if (!data || data.nModified === 0) {
        // Check if no document was modified
        return res.status(404).send({
          message: `Cannot update user with ${userid} not found or no modifications were made`,
        });
      }
      res.send({ message: "1 document updated" });
    })
    .catch((err) => {
      console.error(err); // Log the error for debugging
      res.status(500).send({ message: "Error updating user" });
    });
};

exports.remoteUserFind = (req,res) => {
  const omeID = req.body.omeID;
  UserDB.aggregate([
      {
          $match: {
              _id: { $ne: new mongoose.Types.ObjectId((omeID)) },
              active: "yes",
              status: "0"
          }
      },
      { $sample: { size: 1 } } // Corrected syntax here
  ]).limit(1).then((data) => {
      res.send(data);
  }).catch((err) => {
      res.status(500).send({
          message: "Error occurred connecting",
          err,
      });
  });
}

exports.getNextUser = (req, res) => {
  const oneID = req.body.oneID; // Corrected variable name
  const remoteUser = req.body.remoteUser;
  let excludedIds = [oneID, remoteUser];

  UserDB.aggregate([
    {
      $match: {
        _id: { $nin: excludedIds.map((id) => new mongoose.Types.ObjectId((id))) },
        active: "yes",
        status: "0",
      },
    },
    { $sample: { size: 1 } },
  ])
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error occurred connecting",
        err,
      });
    });
};
