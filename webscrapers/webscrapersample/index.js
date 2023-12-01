const express=require('express')
const app= express()

const rp=require('request-promise') //makes ajax request from other webites

const cheerio=require('cheerio').default 
const puppeteer=require('puppeteer')
const path=require('path')

const Scraper=require('images-scraper')
const fs = require("fs");
const request=require("request")

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'))

app.use(express.json());
app.use(express.urlencoded());


//USING PUPPETEER - IT FIRST LAUNCHES BROWSER INSTANCE, TARGETS OR SELECTS URL TO CRAWL 
app.get('/reddit',async(req,res)=>{
    
    let h1,h2,h3,h4,h5,h6=[];
    let obj={}
    let tagArray=["h1","h2","h3","h4","h5","h6"]

    const url="https://reddit.com"

    async function getTags(tag,html){
        let newarray=[];
        cheerio(tag, html).each(function(val,i) {
            newarray.push(cheerio(this).text())
        }) 
            obj[`${tag}`]=newarray
    }
    
    //launching browser instance
    await puppeteer.launch()  
        .then(function(browser) {
        return browser.newPage();
        })

        //go to particular page's url
        .then(async function(page) {
            await page.goto(url)
            return await page.content()
         })

        .then(async function(html) {
            tagArray.forEach(async val => {
                await getTags(val,html) //calling function
            });
            
        })

        .catch(function(err) {
            console.log("Oops, caught an error",err)
        });
      
    console.log(obj)
    res.send(obj)
    // res.render('reddit',{obj:obj})
})

app.get('/screenshot',async(req,res)=>{

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://google.com');

    //capturing image and dsaving it in same directory
    let img= await page.screenshot({path: 'example.png', fullPage:true});

    await browser.close();
    console.log(img)

  res.render('screenshot')

})

app.get('/imglink',(req,res)=>{
    var writeStream=fs.WriteStream('imagelink.txt','UTF-8')

    var x= 'https://reddit.com'

    request(x,(err,resp,html)=>{
        if(!err && resp.statusCode== 200){
            console.log("working")
            const $= cheerio.load(html)
            $('img').each((index,image)=>{
                var img= $(image).attr('src')
                var baseurl= x
                var link= baseurl+img
                writeStream.write(link)
                writeStream.write('\n')
            })
        }else{
            console.log("not working")
        }
    })
    // res.render('home')
})

app.get('/multipleHTMLtags',async(req,res)=>{
    let a=[];
    const html = `
  <div>This is a div element</div>
  <span>This is a span element</span>
  <div>This is another div element</div>
  <p> Paragragh - lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum</p>
`;

// Load the HTML content into a Cheerio object
const $ = cheerio.load(html);

// Find all div and span elements
const divsAndSpans = $('div, span, p');

// Iterate over each div and span element and print its text content
divsAndSpans.each((i, element) => {
   a.push($(element).text());
   
});

res.render('home',{x:a})
})


app.listen(3000,()=>{
    console.log("listening on port 3000")
})