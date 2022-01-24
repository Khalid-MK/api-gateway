// Load express 
const express = require('express');
const router = express.Router();
const axios = require('axios');
const registry = require('./registry.json')
const fs = require('fs');
const loadBalancer = require('../util/loadBalancer');

router.post('/unregister', (req, res) => {
    const registrationInfo = req.body;

    if (registrationInfo && registrationInfo.apiName) {
        if (apiIsAlreadyRegistered(registrationInfo)) {
            const index = registry.services[registrationInfo.apiName].instances.indexOf(instanse => {
                return registrationInfo.url === instanse.url
            })
            registry.services[registrationInfo.apiName].instances.splice(index, 1);

            fs.writeFile('./routes/registry.json', JSON.stringify(registry), err => {
                if (err) {
                    res.status(400).json({ error: `Could not unregister ${registrationInfo.apiName} \n ${err.message}` });
                } else {
                    res.send(`Successfully unregistered ${registrationInfo.apiName}`)
                }
            })

        } else {
            res.status(404).json({ error: `Configuration doesn't exist for ${registrationInfo.apiName} -- at ${registrationInfo.url}` })
        }
    } else {
        res.status(404).json({ error: "API Name not found" })
    }

})

router.post('/register', (req, res) => {
    const registrationInfo = req.body;

    if (registrationInfo && registrationInfo.apiName) {
        registrationInfo.url = registrationInfo.protocol + '://' + registrationInfo.host + ':' + registrationInfo.port + '/'

        if (apiIsAlreadyRegistered(registrationInfo)) {
            res.status(404).json({ error: `Configuration already exist for ${registrationInfo.apiName} -- at ${registrationInfo.url}` })
        } else {
            registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo })

            fs.writeFile('./routes/registry.json', JSON.stringify(registry), err => {
                if (err) {
                    res.status(400).json({ error: `Could not register ${registrationInfo.apiName} \n ${err.message}` });
                } else {
                    res.send(`Successfully registered ${registrationInfo.apiName}`)
                }
            })
        }
    } else {
        res.status(404).json({ error: "API Name not found" })
    }
})

router.all(`/:apiName/:path(*)?`, (req, res) => {
    const service = registry.services[req.params.apiName];
    if (service) {
        if (!service.loadBalanceStrategy) {
            service.loadBalanceStrategy = "ROUND_ROBIN"
            fs.writeFile('./routes/registry.json', JSON.stringify(registry), err => {
                if (err) {
                    res.status(400).json({ error: `Could not add loadBalanceStrategy` });
                }
            })
        }

        const newIndex = loadBalancer[service.loadBalanceStrategy](service)
        const url = service.instances[newIndex].url
        const config = {
            method: req.method,
            url: url + req.params.path,
            headers: req.headers,
            data: req.body
        }
        // console.log(config)
        axios(config)
            .then((response) => {
                res.send(response.data);
            }).catch((error) => {
                res.status(400).json({ error: error.message });
            })

    } else {
        res.status(404).json({ error: "API Name does`t exist!" })
    }

})

const apiIsAlreadyRegistered = (registrationInfo) => {
    let exist = false;
    if (registry.services[registrationInfo.apiName] && registry.services[registrationInfo.apiName].instances.length > 0) {
        registry.services[registrationInfo.apiName].instances.forEach(insatance => {
            if (insatance.url === registrationInfo.url) {
                exist = true;
                return;
            };
        });
    }

    return exist;
}

module.exports = router;