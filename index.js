//Imports
require('dotenv').config();
const axios = require('axios');

//Vars
let _since = "20190405T030000";
let _until = "20190406T030000";

async function getVehicleJourneysCount(since, until)
{
    const url = "https://api.sncf.com/v1/coverage/sncf/vehicle_journeys//?since=" + since + "&until=" + until + "&count=1";
    const config = {
        auth: {
            username: process.env.SNCF_KEY,
            password: ''
        }
    };

    return (await axios(url, config).then(res => res.data.pagination.total_result));
}

async function getDisruptions(since, until)
{
    let items = 0;
    let page = 0;
    let disruptions = [];

    while (items === 1000 || page === 0) {
        const url = "https://api.sncf.com/v1/coverage/sncf/disruptions//?since=" + since + "&until=" + until + "&count=5000&start_page=" + page + "&";
        const config = {
            auth: {
                username: process.env.SNCF_KEY,
                password: ''
            }
        };

        await axios(url, config).then(res => {
            items = res.data.pagination.items_on_page;

            disruptions = disruptions.concat(res.data.disruptions);
        });



        page++;
    }
    return disruptions;
}

async function getDelayedPercentage(since, until) {

    const disruptions = await getDisruptions(since, until);
    const vehicleJourneys = await getVehicleJourneysCount(since, until);

    const delayedTrains = disruptions.filter(el => {
        if (el.severity.effect === 'SIGNIFICANT_DELAYS')
            return el;
        return null
    });

    console.log("nb delayed: " + delayedTrains.length);
    console.log("nb vehicle: " + vehicleJourneys);
    console.log(((100 * delayedTrains.length) / vehicleJourneys) + "%");
}

getDelayedPercentage(_since, _until);