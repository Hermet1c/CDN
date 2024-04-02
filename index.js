const passphrase = '' //Passphrase to uplaod media and create short links
const tls = false //false = 'http', true = 'https'
const privateKey = '/path/to/private/key' //Needed for secure tls connections
const certificate = '/path/to/certificate' //Needed for secure tls connections



const express = require('express')
const app = express()
const fs = require('fs')
const multer = require('multer');
const path = require('path');
const uuid = require('uuid')
const https = require('https')

const mediaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'cdn/')
    },
    filename: function (req, file, cb) {
        console.log(`Saving file: ${file.originalname}`)
        const ext = path.extname(file.originalname);
        cb(null, `${uuid.v4().replace(/-/g, '').substring(0, 6)}${ext}`);
    }
});
const mediaUpload = multer({ storage: mediaStorage, fileField: 'file' });


const textStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'cdn/')
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${uuid.v4().replace(/-/g, '').substring(0, 6)}${ext}`);
    }
});
const textUpload = multer({ storage: textStorage, fileField: 'file' });

const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp', 'mpeg', 'mpg', 'm2v', 'mxf', 'ogv', 'vob']; const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'];

app.use('/cdn', express.static('cdn'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.get('/:file', (req, res) => {
    console.log(`Asset requested: media/${req.params.file}`)
    const ext = req.params.file.split('.').pop()
    const json = JSON.parse(fs.readFileSync(`./cdn/json/${req.params.file}.json`))

    if (imageExtensions.includes(ext)) file = new html('image')
    else if (videoExtensions.includes(ext)) file = new html('video')
    else if (ext == 'txt') {
        const text = fs.readFileSync(`./cdn/${req.params.file}`, 'utf-8')
        const description = text.split(' ').slice(0, 40).join(' ') + '...'
        file = new html('text').replace('text', 'Text Upload: \n\n' + description)
    }


    file.replace('file', req.params.file)
        .replace('title', json.title)
        .replace('date', json.date)
        .replace('desc', json.desc)
        .replace('siteName', json.provider_name)
        .replace('colour', json.colour)
    res.send(file.file)

})

app.get('/links/:linkId', (req, res) => {
    console.log(`Short link Clicked: ${req.params.linkId}`)
    const file = fs.readFileSync(`./cdn/links/${req.params.linkId}`, 'utf-8')
    res.send(file)
})

app.post('/', mediaUpload.single('file'), (req, res) => {
    if (req.headers.passphrase !== passphrase) return res.sendStatus(401)

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }



    const json = JSON.stringify({
        "version": "1.0",
        "type": "link",
        "title": req.headers.title ?? "",
        "author_name": req.headers.author ?? "",
        "author_url": req.headers.authorurl ?? "",
        "provider_name": req.headers.provider ?? "",
        "provider_url": req.headers.providerurl ?? "",
        "colour": req.headers.colour ?? "#000000",
        "desc": req.headers.desc ?? "",
        "date": new Date().toISOString()
    }, null, 4)
    fs.writeFileSync(`cdn/json/${req.file.filename}.json`, json)
    console.log(`File uploaded: ${req.file.filename}\n${json}`)
    const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
    res.json({ imageUrl });
});

app.post('/links', (req, res) => {
    if (req.headers.passphrase !== passphrase) return res.sendStatus(401)

    const url = uuid.v4().replace(/-/g, '').substring(0, 6)

    const html = `<head>
    <script>
        window.location.href="${req.body.url}"
    </script>
</html>`

    fs.writeFileSync(`cdn/links/${url}`, html)
    console.log(`Short link Created: ${url}`)
    const linkUrl = `${req.protocol}://${req.get('host')}/links/${url}`;
    res.json({ linkUrl });
});


class html {
    constructor(file) {
        this.file = fs.readFileSync(`./html/${file}.html`, 'utf-8')
    }

    replace(item, replacer) {
        this.file = this.file.replace(new RegExp(';:' + item + ':;', 'g'), replacer);
        return this
    }

}




if (tls) {
    const server = https.createServer({
        key: fs.readFileSync(privateKey), // Private key
        cert: fs.readFileSync(certificate) // Full certificate chain
    }, app);



    server.listen(443, () => { console.log('Started on TLS port 443') })
} else {
    app.listen(80, () => { console.log('Started on HTTP port 80') })
}
