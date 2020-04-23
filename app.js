//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const app = express();
const _ = require('lodash')

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://yugandharp:Test123@yugandhar-cluster-pciob.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Complete assignment",
});
const item2 = new Item({
  name: "Cook food",
});

const item3 = new Item({
  name: "Eat Food",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {

  
  Item.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      if(items.length === 0) {
        Item.insertMany(defaultItems, (err) => {
          if(err) {
            console.log(err);
          }else {
            console.log("Successfully added default item list");
          }
        })
        res.redirect("/")
      }else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
      
    }
  })
});

app.get("/:category", function (req, res) {

  const category = _.capitalize(req.params.category)
  console.log(category)
  List.findOne({name: category}, (err, listItem) => {
    if (!err) {
      if(!listItem) {
        const list = new List({
          name: category,
          items: defaultItems
        })
        list.save()
        res.redirect("/" + category)
      }else {
        res.render("list", { listTitle: listItem.name, newListItems: listItem.items })
      }
        
      
    }
  })
  
})

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const category = req.body.list;
  const listItem = new Item({
    name: itemName
  })

  if(category === "Today") {
    listItem.save()
    res.redirect("/")
  }else {
    List.findOne({name: category}, (err, foundList) => {
    foundList.items.push(listItem)
    foundList.save()
    res.redirect("/" + category)
  })
  
} 
  
});

app.post("/delete", (req,res) => {
  const checkedItemId = req.body.checked
  const listName = req.body.listName

  if (listName === "Today") {
    Item.findByIdAndDelete(checkedItemId, (err) => {
      if (err) {
        console.log(err)
      }else {
        console.log("successfully deleted")
      }
      res.redirect("/")
    })
  }else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
      if (!err) {
        
        res.redirect("/" + listName)
      }
    })
  }

  
})


app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
