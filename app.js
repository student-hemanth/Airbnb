const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const {listingSchema}=require("./schema.js");


const mongo_url='mongodb://127.0.0.1:27017/wanderlist';

main().then(()=> {
    console.log("connection sucessful");
})
.catch((err)=> {
    console.log(err);
});

async function main() {
    await mongoose.connect(mongo_url);
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/",(req,res)=> {
    console.log("i am root");
});
//index route
app.get("/listings",wrapAsync(async(req,res)=> {
    const Alllistings=await Listing.find({});
    res.render("listings/index.ejs",{Alllistings});
}));
//new route
app.get("/listings/new",wrapAsync(async(req,res)=> {
    res.render("listings/new.ejs");

}));
//show route
app.get("/listings/:id",wrapAsync(async(req,res)=> {
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}));
//create route
app.post("/listings",wrapAsync(async(req,res,next)=> {
    if(!req.body.listing) {
        throw new ExpressError(400,"send valid data for lisitng");
    }
   const newlisting=new Listing(req.body.listing);
   await newlisting.save();
   res.redirect("/listings");
}));
//edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=> {
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
//update route
app.put("/listings/:id",wrapAsync(async(req,res)=> {
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings/${id}");
}));
//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=> {
    let {id}=req.params;
    let deletedlisting=await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
}));

// app.get("/testlisting",async(req,res)=> {
//     let samplelisting=new Listing ( {
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calaangute,Goa",
//         country:"india",
//     });
//     await samplelisting.save()
//                       .then(()=> {
//                     console.log("sample was saved");
//                     res.send("sucessful testing");
//                     })
//                     .catch((err)=> {
//                     console.log(err);
//                     });
// });
app.use((req,res,)=> {
    res.status(404).send("404 page not found").render("error.js");
});
app.use((err,req,res,next)=> {
     let{statuscode=500,message="something wrong"}=err;
     res.status(statuscode).render("error.ejs" ,{message});
    //  res.status(statuscode).send(message);
 });

app.listen(8080,()=> {
    console.log("server working on the port 8080");
});