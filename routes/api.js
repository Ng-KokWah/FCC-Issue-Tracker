/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {  
  app.route('/api/issues/:project')
    
    //DONE
    .get(function (req, res){
      var project = req.params.project;
      var created_by = req.query.created_by;
      var assigned_to = req.query.assigned_to;
      var open = req.query.open; 
      

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var dbo = db.db("issuetracker");
        
            dbo.collection("issues").find({projectname: project}).project({projectname: 0}).toArray(function(err, result) {
            if(result == null || result == "") {
              res.json({error: "no records found!"});
            }
            else {
              if(created_by == null || created_by == "") {
                res.json(result);
                db.close();
              }
              else {
               dbo.collection("issues").find({projectname: project, created_by: created_by}).project({projectname: 0}).toArray(function(err, r2) {
                   if(r2 == null || r2 == "") {
                      res.json({error: "no records found!"});
                    }
                   else {
                     if(assigned_to == null || assigned_to == "") {
                       res.json(r2);
                       db.close();
                     }
                     else {
                       dbo.collection("issues").find({projectname: project, created_by: created_by, assigned_to: assigned_to}).project({projectname: 0}).toArray(function(err, r3) {
                         if(r3 == null || r3 == "") {
                            res.json({error: "no records found!"});
                         }
                         else {
                           if(open == null || open == "") {
                             res.json(r3);
                             db.close();
                           }
                           else {
                             if(open == "true") {
                                open = true;
                              }
                             if(open == "false") {
                              open = false; 
                             }
                             dbo.collection("issues").find({projectname: project, created_by: created_by, assigned_to: assigned_to, open: open}).project({projectname: 0}).toArray(function(err, r4) {
                               if(r4 == null || r4 == "") {
                                  res.json({error: "no records found!"});
                               }
                               else {
                                 res.json(r4);
                                 db.close();
                               }
                             });
                           }
                         }
                       });
                     }
                   }
               });
              }
              
            }
          });
      });
    })
    
    //DONE
    .post(function (req, res){
      //issue_title, issue_text, created_by, and optional assigned_to and status_text
      var project = req.params.project;
    
      var objectId = new ObjectId();
      var title = req.body.issue_title;
      var desc = req.body.issue_text;
      var createdBy = req.body.created_by;
      var createdOn = new Date();
      var updatedOn = new Date();
    
      //optional
      var assignTo = "";
      var status_text = "";
    
      if(req.body.assigned_to != null || req.body.assigned_to != "") {
         assignTo = req.body.assigned_to;
      }
      
      if(req.body.status_text != null || req.body.status_text != "") {
         status_text = req.body.status_text;
      }
      
    if((title == null || title == "") && (desc == null || desc == "") && (createdBy == null || createdBy == "")) {
     res.json({error: "fill in all required fields!"}); 
    }
    else {
      var myobj = {_id: objectId, issue_title: title, issue_text: desc, created_on: createdOn.toISOString(), updated_on: updatedOn.toISOString(), created_by: createdBy, assigned_to: assignTo, open: true, status_text: status_text};
      var toBeAdded = {_id: objectId, projectname: project, issue_title: title, issue_text: desc, created_on: createdOn.toISOString(), updated_on: updatedOn.toISOString(), created_by: createdBy, assigned_to: assignTo, open: true, status_text: status_text};
    
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
          if (err) throw err;
            var dbo = db.db("issuetracker");
        
        dbo.collection("issues").insertOne(toBeAdded, function(err, res) {
              if (err) throw err;
              db.close();
        });    
      });
    
      res.json(myobj);  
    }
    })
    
    //DONE
    .put(function (req, res){
      var project = req.params.project;
      var issueID = req.body._id;
      var open = req.body.open;
    
      //optional
      var title = "";
      var desc = "";
      var createdBy = "";
      var createdOn = "";
      var updatedOn;
      
      var assignTo = "";
      var status_text;
    
      if(req.body.issue_title != null || req.body.issue_title != "") {
         title = req.body.issue_title;
      }
    
      if(req.body.issue_text != null || req.body.issue_text != "") {
         desc = req.body.issue_text;
      }
    
      if(req.body.created_by != null || req.body.created_by != "") {
         createdBy = req.body.created_by;
      }
      
      if(req.body.assigned_to != null || req.body.assigned_to != "") {
         assignTo = req.body.assigned_to;
      }
      
      if(req.body.status_text != null || req.body.status_text != "") {
         status_text = req.body.status_text;
      }
    
      if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
        res.json({error: 'no updated field sent'});
      }
      else {
        MongoClient.connect(CONNECTION_STRING, function(err, db) {
        var dbo = db.db("issuetracker");
        
        dbo.collection("issues").findOne({_id: ObjectId(issueID), projectname: project}, function(err, result) {
          if(result == null || result == "") {
            res.json({error: "could not update " + issueID + " no records found! you need to create an issue first before attempting to update!"});
            db.close();
          }
          else {
            createdOn = new Date(result.created_on);
            updatedOn = new Date();
            
            if(title == null || title == "") {
               title = result.issue_title;
            }
    
            if(desc == null || desc == "") {
               desc = result.issue_text;
            }
    
            if(createdBy == null || createdBy == "") {
               createdBy = result.created_by;
            }
      
            if(assignTo == null || assignTo == "") {
               assignTo = result.assigned_to;
            }
      
            if(status_text != null || status_text != "") {
               status_text = result.status_text;
            }
            
            if(open == "true") {
               open = true; 
            }
            
            if(open == "false") {
              open = false; 
            }
            
            var myoutput = {_id: ObjectId(issueID), issue_title: title, issue_text: desc, created_on: createdOn.toISOString(), updated_on: updatedOn.toISOString(), created_by: createdBy, assigned_to: assignTo, open: open, status_text: status_text};;
            
            var toBeAdded = {_id: ObjectId(issueID), projectname: project, issue_title: title, issue_text: desc, created_on: createdOn.toISOString(), updated_on: updatedOn.toISOString(), created_by: createdBy, assigned_to: assignTo, open: open, status_text: status_text};
            //delete the old issue
            dbo.collection("issues").deleteOne({_id: ObjectId(issueID), projectname: project}, function(err, obj) {
                if (err) throw err;
              });
            
            dbo.collection("issues").insertOne(toBeAdded, function(err, res) {
              if (err) {
                myoutput = {error: "could not update " + issueID};
              }
              else {
                myoutput = {success: 'successfully updated'};
              }
            });    
            
            res.json(myoutput);
            db.close();
          }
        });
        });
      }
    })
    
    //DONE
    .delete(function (req, res){
      var project = req.params.project;  
      var issueID = req.body._id;
      
      if(issueID == null || issueID == "") {
       res.json({error: "No ID specified!!"}); 
      }
    else {
      MongoClient.connect(CONNECTION_STRING, function(err, db) {
          if (err) throw err;
            var dbo = db.db("issuetracker");
        
        dbo.collection("issues").deleteOne({_id: ObjectId(issueID)}, function(err, obj) {
            if (err) throw err;
        });
        res.json({success: "deleted"});
      });
      }
    });
    
};
