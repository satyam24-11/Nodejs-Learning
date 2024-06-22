const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
//const users = require('./MOCK_DATA.json');
const app = express();
const port = 3000;
//connection
mongoose
    .connect('mongodb://127.0.0.1:27017/trial-app-1')
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log('Mongo Error', err));
//schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        tyoe: String,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    jobTitle: {
        type: String,
    },
    gender: {
        type: String,
    },
});

const User = mongoose.model('user', userSchema);

//middlewares - Plugins
app.use(express.urlencoded({ extended: false }));


app.use((req, res, next) => {
    fs.appendFile('log.txt', `${Date.now()}; ${req.method}: ${req.path} \n`, (err) => {
        if (err) {
            console.log(err);
        }
    });
    next();
});
// routes
app.get('/users', async (req, res) => {
    const allDbUsers = await User.find();
    const html = `
    <ul>
    ${allDbUsers.map((user) => `<li>${user.firstName}-${user.email}</li>`).join('')}
    </ul>
    `;
    res.send(html);
});
//REST API
app.get('/api/users', async (req, res) => {
    const allDbUsers = await User.find();
   // res.setHeader('X-MyName', 'Satyam'); // Custom headers
    // Always add X to custom headers
    return res.json(allDbUsers);
});

app.route('/api/users/:id')
    .get(async(req, res) => {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ status: "User not found" });
        }
        return res.json(user);
    })
    .patch(async(req, res) => {
        const user = await User.findByIdAndUpdate(req.params.id, {lastName:'changed'});
        const body = req.body;
       // users[users.indexOf(user)] = { ...user, ...body };
        // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        //     if (err) {
        //         console.log(err);
        //     }
        //     return res.json({ status: "success" });
        // });
        return res.json({ status: "success" });
    })
    .delete(async(req, res) => {
        const user = await User.findByIdAndDelete(req.params.id);
       // users.splice(users.indexOf(user), 1);
        // fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        //     if (err) {
        //         console.log(err);
        //     }
        //     return res.json({ status: "success" });
        // });
        return res.json({ status: "success" });
    });


// app.get('/api/users/:id', (req, res) => {
//     const id = Number(req.params.id);
//     const user = users.find((user) => user.id === id);
//     return res.json(user);
// });
app.post('/api/users', async (req, res) => {
    const body = req.body;
    if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
        return res.status(400).json({ msg: 'All fields are required' });
    }
    const result = await User.create({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        gender: body.gender,
        jobTitle: body.job_title,
    });
    console.log("result", result);
    return res.status(201).json({ msg: "sucess" });
});
app.put('/api/users/:id', async(req, res) => {
    // const id = Number(req.params.id);
    // const user = users.find((user) => user.id === id);
    const user = await User.findById(req.params.id);
    const body = req.body;
    users[users.indexOf(user)] = { ...user, ...body };
    fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
        if (err) {
            console.log(err);
        }
        return res.json({ status: "success" });
    });
});


// app.patch('/api/users/:id', (req, res) => {
//     const id = Number(req.params.id);
//     const user = users.find((user) => user.id === id);
//     const body = req.body;
//     users[users.indexOf(user)] = { ...user, ...body };
//     fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
//         if (err) {
//             console.log(err);
//         }
//         return res.json({ status: "success" });
//     });
// });
// app.delete('/api/users/:id', (req, res) => {
//     const id = Number(req.params.id);
//     const user = users.find((user) => user.id === id);
//     users.splice(users.indexOf(user), 1);
//     fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
//         if (err) {
//             console.log(err);
//         }
//         return res.json({ status: "success" });
//     });
// });
app.listen(port, () => console.log(`Server started at Port: ${port}`))