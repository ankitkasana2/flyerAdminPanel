
const fetch = require('node-fetch');

async function testAdminEmail() {
    const response = await fetch('http://localhost:3000/api/send-ready-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: 'ORD-TEST-ADMIN',
            customerName: 'Ankit Kasana Admin Test',
            customerEmail: 'ankitkasana2@gmail.com',
            flyerName: 'Admin Finished Flyer',
            downloadUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab',
            imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab'
        })
    });

    const data = await response.json();
    console.log(data);
}

testAdminEmail();
