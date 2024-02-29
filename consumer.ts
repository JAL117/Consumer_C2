import amqp from 'amqplib';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function getEvent() {
    const url = process.env.URL ?? "";
    const conn = await amqp.connect(url);
    const channel = await conn.createChannel();

    const exchange = 'Prueba';

    await channel.assertExchange(exchange, 'direct', {durable: true});

    const queueName = 'initial';
    const queue = await channel.assertQueue(queueName, {exclusive: false});
    await channel.bindQueue(queue.queue, exchange, '12345');

    console.log('Escuchando eventos en RabbitMQ');

    channel.consume(queue.queue, async(mensaje)=>{
        if(mensaje !== null){
            console.log(`Mensaje recibido: ${mensaje.content.toString()}`);
            try {
                const id = Number(mensaje.content);
                const response = await axios.post('https://api-2-c2.onrender.com/history',{id_user:id, registration:"Usuario Registrado"});
                
            } catch (error) {
                console.log("Error sending to API");   
            }
        }
    }, {noAck:true});
}
getEvent().catch(console.error);