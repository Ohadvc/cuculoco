module.exports = {
    integration: {
        urls: {
            env: 'https://www.meet2know.com',
            operator: 'https://operator.meet2know.com',
            auth: 'https://vcita:staging@www.meet2know.com/signup',
            frontage: 'https://app.meet2know.com',
            apis: {
                core_url: 'https://api2.meet2know.com',
                vcita_url: 'https://api.meet2know.com'
            }
        },
        directory_token: 'ff333ad7960d32e873d48d5de772f826',
        directory_id: 970,
        admin_token: 'kjh7tdewtfvdewolmmd',
        timeout: 60 * 1000
    },
    dev: {
        urls: {
            env: 'http://www.dev-vcita.me:3000',
            operator: 'http://localhost:2026',
            auth: null,
            frontage: 'http://app.dev-vcita.me:7200',
            apis: {
                core_url: 'http://api2.dev-vcita.me:7100',
                vcita_url: 'http://api.dev-vcita.me:3000'
            }
        },
        directory_token: '204d77f206d0023a130dc5361052501f',
        directory_id: 1,
        admin_token: 'kjh7tdewtfvdewolmmd',
        timeout: 120 * 1000
    }
}
