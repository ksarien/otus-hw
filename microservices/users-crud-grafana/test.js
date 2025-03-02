import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://arch.homework/api/user';

export let options = {
    stages: [
        { duration: '1m', target: 100 },
        { duration: '1m', target: 300 },
        { duration: '1m', target: 500 },
        { duration: '2m', target: 1000 },
        { duration: '30s', target: 0 },   // Постепенное завершение теста
    ],
    thresholds: {
        'http_req_failed': ['rate<0.1'], // Ошибки должны быть <10% (в идеале)
        'http_req_duration': ['p(95)<1000'], // 95% запросов должны укладываться в 2 секунды
    },
};

export default function () {
    let timestamp = Date.now();

    // 1. Создание пользователя
    let createPayload = JSON.stringify({
        username: `user_${__VU}_${__ITER}_${timestamp}`,
        firstName: "John",
        lastName: "Doe",
        email: `user_${__VU}_${__ITER}_${timestamp}@example.com`,
        phone: "+1234567890"
    });

    let createHeaders = { 'Content-Type': 'application/json' };
    let createRes = http.post(BASE_URL, createPayload, { headers: createHeaders });

    let success = check(createRes, {
        'User created successfully': (res) => res.status === 201
    });

    if (!success) {
        console.error(`❌ User creation failed: ${createRes.status} - ${createRes.body}`);
        sleep(1);
        return;
    }

    let userData;
    try {
        userData = JSON.parse(createRes.body);
    } catch (e) {
        console.error(`❌ Failed to parse response body: ${createRes.body}`);
        sleep(1);
        return;
    }

    if (!userData.id) {
        console.error(`❌ User ID not found in response: ${JSON.stringify(userData)}`);
        sleep(1);
        return;
    }

    let userId = userData.id;

    // 2. Получение списка пользователей
    let listRes = http.get(BASE_URL);
    check(listRes, { 'Users list retrieved': (res) => res.status === 200 });

    // 3. Получение пользователя по ID
    let getRes = http.get(`${BASE_URL}/${userId}`);
    check(getRes, { 'User retrieved': (res) => res.status === 200 });

    // 4. Обновление пользователя (уникальный email)
    let updatePayload = JSON.stringify({
        firstName: "Johnny",
        lastName: "Doe",
        email: `updated_${__VU}_${__ITER}_${timestamp}@example.com`
    });

    let updateRes = http.put(`${BASE_URL}/${userId}`, updatePayload, { headers: createHeaders });
    check(updateRes, { 'User updated': (res) => res.status === 200 });

    // 5. Удаление пользователя
    let deleteRes = http.del(`${BASE_URL}/${userId}`);
    check(deleteRes, { 'User deleted': (res) => res.status === 200 });

    sleep(1);
}
