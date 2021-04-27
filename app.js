require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const ejs = require("ejs");
const session = require("express-session");
const passport  = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const LocalStrategy = require('passport-local').Strategy
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: false
}));
var v;
app.use(passport.initialize());
app.use(passport.session());

var check = Number(0);
const PUBLISHABLEKEY=process.env.PUBLISHABLEKEY;
const SECRETKEY=process.env.SECRETKEY;
const stripe = require('stripe')(SECRETKEY);
mongoose.connect("mongodb://localhost:27017/railsDBS2",{useNewUrlParser : true,useUnifiedTopology : true});
mongoose.set("useCreateIndex",true);
const trains = ({
  name : String,
  source : String,
  destination : String,
  price :Number,
  capacity : Number,
  type : String,
});
const userSchema = new mongoose.Schema({
    username : String,
    password : String
});
userSchema.plugin(passportLocalMongoose);
app.get("/editprofile",function(req,res){
  res.render("editprofile");    
});

const User = new mongoose.model("User",userSchema);
passport.use('userLocal', new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const occupies = ({
name : String,
val : Number
});

const items = ({
    name : String,
    id : String,
    train : String,
    from : String,
    to : String,
    date : String,
    type : String,
    verified : String
});

const it = mongoose.model("item",items);



const cancels = ({
    number : String,
    name : String
});

const tr = mongoose.model("train",trains);
const or = mongoose.model("occupy",occupies);
const cr = mongoose.model("cancel",cancels);
app.get('/',function(req,res){
    
    res.render("home");
});
app.get("/login",function(req,res){
res.render("user");
});
app.get("/register",function(req,res){
res.render("user");
});
app.get("/user",function(req,res){
 
    res.render("user");
});
app.get('/admin',function(req,res){
    res.render("inter");
});
app.get("/loggedin",function(req,res){
    
    if(Object.keys(req._passport).length === 1) res.redirect("/");
    else {

    
    const uu = req._passport.session.user;
    
    
    if(req.isAuthenticated()){
           
            res.render("loggedin",{
                us : uu
            });
        }
        else {
            res.redirect("/login");
        }
    }  
      });

app.post("/login",function(req,res){
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });
    const uu = req.body.username;
    req.login(user,function(err){
        if(err)
        {
          console.log(err);
          res.redirect("/login");
        }
        else {
        
            passport.authenticate("userLocal")(req,res,function(){
                
                res.redirect("/loggedin");
               });
          //})
        }
    
    })
  
  });


app.get("/EditTrain",function(req,res){
    if(!check) res.redirect("/");
    else res.render("EditTrains");
})
app.get("/DeleteTrain" ,function(req,res){
    if(!check) res.redirect("/");
    else res.render("DeleteTrain");
})
app.post("/DeleteTrain",function(req,res){
    tr.deleteOne({name : req.body.name , type : req.body.type},function(err){
        if(err) console.log(err);
    })
    res.redirect("/root");
    
    app.get('/root',function(req,res){
        tr.find({},function(err,foundItems){
            if(!err)
            {
                res.render("root",{
                    her : foundItems
             })
            }
        })
    }) 

})
app.post("/ChangeDetails",function(req,res){
console.log(req.body);

  tr.deleteOne({name : req.body.trainname, type : req.body.traintype},function(err){
      if(err) console.log(err);
  })
  const name = req.body.trainname;
  const source = req.body.source;
  const destination = req.body.destination;
  const price = req.body.price;
  const capacity = req.body.capacity;
  const type = req.body.traintype;
  
  const t = new tr({
   name : name,
   source : source.toLowerCase(),
   destination:destination.toLowerCase(),
   price:price,
   capacity:capacity ,
   type : type
});

  t.save();
  res.redirect("/root");
    
})

  app.get("/logout",function(req,res){

   check = 0;
    req.session.destroy(function() {
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
  });
  app.get("/test",function(req,res){
      res.render("test");
  });
  app.get("/bb",function(req,res){
      console.log(req._passport.session.user);
     res.redirect("/loggedin"); 
  });

  app.post("/register",function(req,res){
    const uu  = req.body.username;
    if(req.body.password!==req.body.repassword) {
        res.redirect("/register");
    }
    else {

    
    User.register({username : req.body.username},req.body.password,function(err){
    if(err)
    {
        res.redirect("/register");
    }
    else {
        passport.authenticate("userLocal")(req,res,function(){
            res.redirect("/loggedin");
           
        })
    }
    });
}
    
});
app.get("/bookedtickets",function(req,res){
console.log(Object.keys(req._passport));
if(Object.keys(req._passport).length==1) res.redirect("/");
if(Object.keys(req._passport).length!=1) {
    const user = req._passport.session.user;
    it.find({name : user},function(err,foundItems){
        if(foundItems)
        {

             res.render("booked",{
                 her : foundItems
             });
        }
        else {
            res.render("booked",{
                her : null
            });
        }
    })
}
    
});

app.get("/admin/root",function(req,res){
  
    if(!check) res.redirect("/");
    else {
        tr.find({},function(err,foundItems){
        if(!err)
        {
            res.render("root",{
                her : foundItems
         })
        }
    })
}
})
app.post('/admin',function(req,res){
const em = req.body.email;
const ps = req.body.password;
const va = process.env.ADMIN;
if(em===va && ps===va)
{
       check = 1;
    res.redirect("/admin/root");
    
        
    
}
else {
    res.redirect("/admin");
}
});

app.get("/Cancel",function(req,res){
  res.render("cancel");
});
app.get("/cancelsuccess",function(req,res){
    res.render("cancelled");
});
app.post('/Cancel',function(req,res){
    const tt = req._passport.session.user;
    it.deleteOne({name : tt,id : req.body.id},function(err){
        if(err) console.log(err);
    })
    cr.findOne({number : req.body.id},function(err,found){
      if(found!=null)
      {
           const name = found.name;
           or.findOne({name : name},function(err,foundItems){
               const occ = foundItems.val;
               or.updateOne({name : found.name},{val : occ-1},function(err){
                if(err) console.log(err);
            });
            cr.deleteOne({number : found.number},function(err){
                if(err) console.log(err);
                else console.log("deleted");
            })
            res.redirect("/cancelsuccess");
           })
      }
      else {
          res.redirect("/Cancel");
      }
    });
})
app.get('/back',function(req,res){
  res.redirect('/loggedin');
});
app.get('/book',function(req,res){
res.render("book");
});
app.post('/date',function(req,res){
    const dt = req.body.date;
    const s= req.body.source.toLowerCase();
    const d = req.body.destination.toLowerCase();

   
    //
    tr.find({$or : [{source : s},{destination : d} ,{source : d},{destination : s}]},function(err,foundItems){
       if(!err)
       {
          res.render("available",{
              her : foundItems,
              date : dt
          });
       }
    });
    //
});


app.get('/failed',function(req,res){
    res.render("failed");
    console.log("failed");
})
app.post("/booking",function(req,res){

    console.log(req.body);
    if(true){
    console.log(req.body);
    if(Object.keys(req.body).length<=1)
    {
        res.redirect("/book");
    }


    if(Object.keys(req.body).length==2)
    {
        

var seats = 0;
var chk = false;
var nu = Number(0);
for(let i = 0;i<req.body.se.length;++i)
{
    if(req.body.se[i]!='') {
        seats = Number(req.body.se[i]);
        chk = true;
        nu++;
    }
}
if(chk===false || nu>1 || seats===0){
    res.redirect("/book");
}
else {


const daytrain = req.body.rr;

or.findOne({name : daytrain},function(err,found){
   if(found!=null)
   {
       const seatsoccupied = found.val;
       const input = found.name.split('+');
       const nam = input[0].split('~');
       const name = nam[0];
       const type = nam[1];
       tr.findOne({$and : [{name : name},{type : type}]},function(err,foundItems){
             if(!err)
             {
                const fr = foundItems.source;
                const des = foundItems.destination;
                const cost = foundItems.price;
                 const capacity = foundItems.capacity;
                 console.log(seatsoccupied);
                 console.log(capacity);
                 console.log(seats);
                 var st = "";
                 if(capacity>=seatsoccupied+seats){
                     or.updateOne({name : found.name},{val : seatsoccupied+seats},function(err){
                         if(err) console.log(err);
                     });
                    var pr = Number(seats)*Number(cost);
                    
                    const us = req.session.passport.user;
                     for(let  i = 0;i<seats;++i)
                     {

                     
                    var pnr = ''+(new Date().valueOf());
                    st+=pnr;
                    if(i<=seats-1) st+="+";

                    
                    const canc = new cr({
                      number : pnr,
                      name : daytrain
                    });
                    canc.save();
                    var inp = daytrain.split('+');
                    console.log(req);   
                    const u = req.session.passport.user;
                    const iidd = pnr;
                    const trainname = nam[0];
                    const datee = inp[1];
                    const typee = nam[1];
                    const order = new it({
                        name : u,
                        id : iidd,
                        train : trainname,
                        from : fr,
                        to : des,
                        date : datee,
                        type : typee,
                        verified : "No"
                    });
                    order.save();
                    console.log(u);
                    console.log(iidd);
                    console.log(trainname);
                    console.log(datee);
                    console.log(fr);
                    console.log(des);
                    console.log(typee);
                }
                console.log(us);
                    
                 console.log(pr);
                        res.render("payment",{
                            pnr : pnr,
                            price : pr,
                            key : PUBLISHABLEKEY,
                            user : us,
                            str : st
                        });
                        console.log("successfull");
                    
                 }
            else {
                console.log("aa");
                res.redirect("/failed");
            }
                 
             }
       })
   }
   else {
       const o = new or({
           name : daytrain,
           val : 0
       });
       o.save();
    

        const seatsoccupied = 0;
        const input = daytrain.split('+');
        const nam = input[0].split('~');
        const name = nam[0];
        const type = nam[1];
        tr.findOne({$and : [{name : name},{type : type}]},function(err,foundItems){
              if(!err)
              {
                 const fr = foundItems.source;
                 const des = foundItems.destination;
                 const cost = foundItems.price;    
                  const capacity = foundItems.capacity;
                  console.log(seatsoccupied);
                  console.log(capacity);
                  console.log(seats);
                  var st = "";
                  if(capacity>=seatsoccupied+seats){
                      or.updateOne({name : daytrain},{val : seatsoccupied+seats},function(err){
                          if(err) console.log(err);
                      });
                    
                     var pr = Number(seats)*Number(cost);
                     const us = req.session.passport.user;
                      for(let  i = 0;i<seats;++i)
                      {
 
                      
                     var pnr = ''+(new Date().valueOf());
                     st+=pnr;
                     if(i<seats-1) st+="+";
                     
                     const canc = new cr({
                       number : pnr,
                       name : daytrain
                     });
                     canc.save();
                     var inp = daytrain.split('+');
                     
                     const u = req.session.passport.user;
                     const iidd = pnr;
                     const trainname = nam[0];
                     const datee = inp[1];
                     const typee = nam[1];
                     const order = new it({
                         name : u,
                         id : iidd,
                         train : trainname,
                         from : fr,
                         to : des,
                         date : datee,
                         type : typee,
                         verified : "No"
                     });
                     order.save();
                     console.log(u);
                     console.log(iidd);
                     console.log(trainname);
                     console.log(datee);
                     console.log(fr);
                     console.log(des);
                     console.log(typee);
                 }
                     
                 console.log(pr);
                        
                         res.render("payment",{
                             pnr : pnr,
                             price : pr,
                             key : PUBLISHABLEKEY,
                             user : us,
                             str : st
                         });
                         console.log("successfull");
                     
                  }
             else {
                 console.log("aa");
                 res.redirect("/failed");
             }
                  
              }
        })
    
   }
})
    }
}
    }
    else {
        res.redirect("/");
    }
});
app.post('/payment',function(req,res){
var inp = req.body.rec.split('#');
var name = inp[0];
var price = inp[1];
console.log(name);
console.log(price);
var item = req.body.itm.split('+');
stripe.customers.create({ 
    email: req.body.stripeEmail, 
    source: req.body.stripeToken, 
    name: name, 
    address: { 
        line1: 'xxx', 
        postal_code: 'xx', 
        city: 'xx', 
        state: 'xx', 
        country: 'xx', 
    } 
}) 
.then((customer) => { 

    return stripe.charges.create({ 
        amount: Number(price*100),    // Charing Rs 25 
        description: 'Web Development Product', 
        currency: 'INR', 
        customer: customer.id 
    }); 
}) 
.then((charge) => { 
    for(let i = 0;i<item.length;++i){
        if(item[i]!==""){

        
        it.updateOne({id : item[i]},{verified : "Yes"},function(err){
            if(err){
                console.log(err);
            }
        })
    }
    }
    res.render("success");
     // If no error occurs 
}) 
.catch((err) => { 
    res.send(err)    // If some error occurs 
}); 
});
app.post('/addtrain',function(req,res){
   const name = req.body.name;
   const source = req.body.source;
   const destination = req.body.destination;
   const price = req.body.price;
   const capacity = req.body.capacity;
   const type = req.body.type;
   
   const t = new tr({
    name : name,
    source : source.toLowerCase(),
    destination:destination.toLowerCase(),
    price:price,
    capacity:capacity ,
    type : type
});

   t.save();
   res.redirect("/root");

});
app.get("/ticketverify",function(req,res){
    res.render("ticketverify");
})
app.post("/verify",function(req,res){
    var str = req.body.id+"+";
    var user = "";
    if(req.session){
        if(req.session.passport){
            if(req.session.passport.user){

                 user = req.session.passport.user;
            }
        }
    }
    it.findOne({id : req.body.id},function(err,found){
           if(found){
               var name = found.train;
               var type = found.type;
               console.log("aa");
               console.log(name);
               console.log(type);
               tr.findOne({name : name,type : type},function(err,f){
                   if(f){
                       console.log("bb");
    var pnr = "";
    if(user==="") res.redirect("/");
    else {
        res.render("payment",{
            pnr : pnr,
            price : f.price,
            key : PUBLISHABLEKEY,
            user : user,
            str : str
        });
    }
                   }
               })
           }
    })

})

app.listen(3000,function(){
    console.log("Server is UP");
})

