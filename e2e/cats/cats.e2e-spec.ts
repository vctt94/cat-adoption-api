import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { CatsModule } from '../../src/cats/cats.module';
import { CoreModule } from '../../src/core/core.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Cat } from '../../src/cats/entities/cat.entity';
import { User } from '../../src/users/entities/user.entity';
import { AuthModule } from '../../src/auth/auth.module';
import * as dotenv from 'dotenv';
dotenv.config();

const testCats = [
  { "age": 2, "breed": "Tabby", "description": null, "gender": "male", "id": 1, "images": ["http://example.com/cat1.jpg", "http://example.com/cat2.jpg"], "name": "Whiskers", "favoritedBy": [] }
];

enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

const mockCatRepository = {
  create: jest.fn().mockImplementation(dto => dto),
  save: jest.fn().mockImplementation(cat => Promise.resolve({ ...cat, id: Math.floor(Math.random() * 1000) })),
  find: jest.fn().mockResolvedValue(testCats),
  findOne: jest.fn().mockImplementation(id => Promise.resolve(testCats.find(cat => cat.id === id))),
  merge: jest.fn().mockImplementation((cat, updates) => ({ ...cat, ...updates })),
  remove: jest.fn().mockResolvedValue(true),
};

describe('Cats', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        CatsModule,
        AuthModule,
        CoreModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT || '', 10),
          username: process.env.DATABASE_USERNAME,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_NAME,
          entities: [Cat, User],
          synchronize: true, // Note: Typically set to false in production
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(Cat),
          useValue: mockCatRepository
        }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('Register an admin user and create cats', async () => {
    // Register an admin user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: Role.ADMIN
      });

    expect(registerResponse.status).toBe(201);

    // Login the admin user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.data.accessToken;

    // Create a cat using the admin user's token
    const createCatResponse = await request(app.getHttpServer())
      .post('/cats')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Whiskers',
        breed: 'Tabby',
        age: 2,
        gender: 'male',
        images: ['http://example.com/cat1.jpg', 'http://example.com/cat2.jpg']
      });
    expect(createCatResponse.status).toBe(201);

    // Use the token for subsequent requests
    const catResponse = await request(app.getHttpServer())
      .get('/cats')
      .set('Authorization', `Bearer ${token}`);

    expect(catResponse.status).toBe(200);
    expect(catResponse.body.data).toEqual(testCats);
  });

  it('Update a cat profile as an admin', async () => {
    // Login the admin user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.data.accessToken;
    // Use the token for subsequent requests
    const catResponse = await request(app.getHttpServer())
      .get('/cats');

    expect(catResponse.status).toBe(200);
    expect(catResponse.body.data).toEqual(testCats);
    const cat = catResponse.body.data[0]
    const updateCatResponse = await request(app.getHttpServer())
      .put(`/cats/${cat.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Whiskers Updated',
        breed: 'Tabby',
        age: 3,
        gender: 'male',
        images: ['http://example.com/cat3.jpg']
      });

    expect(updateCatResponse.status).toBe(200);
    expect(updateCatResponse.body.data.name).toEqual('Whiskers Updated');
  });

  it('Register a non-admin user', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'user12345',
        role: Role.USER
      });

    const user = registerResponse.body.data.user
    expect(registerResponse.status).toBe(201);
    expect(user).toHaveProperty('email', 'user@example.com');
    expect(user).toHaveProperty('role', Role.USER);
    expect(user).not.toHaveProperty('password'); // Ensure the password is not returned
  });

  it('Attempt to create and delete a cat profile as a non-admin user should fail', async () => {
    // Login the non-admin user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'user12345'
      });

    const token = loginResponse.body.data.accessToken;

    // Attempt to create a cat
    const createCatResponse = await request(app.getHttpServer())
      .post('/cats')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Luna',
        breed: 'Sphynx',
        age: 3,
        gender: 'female',
        images: ['http://example.com/cat3.jpg']
      });

    expect(createCatResponse.status).toBe(403);  // HTTP 403 Forbidden

    const deleteCatResponse = await request(app.getHttpServer())
      .delete(`/cats/1`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteCatResponse.status).toBe(403);
  });

  it('User add cat favorite and remove cat favorite', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'user12345'
      });

    const token = loginResponse.body.data.accessToken;
    const catResponse = await request(app.getHttpServer())
      .get('/cats');

    expect(catResponse.status).toBe(200);
    const testCatId = catResponse.body.data[0].id

    const favoriteResponse = await request(app.getHttpServer())
      .put(`/users/cats/${testCatId}/favorite`)
      .set('Authorization', `Bearer ${token}`);

    expect(favoriteResponse.status).toBe(200);
    expect(favoriteResponse.body.data.favoritedCats.length).toBeGreaterThanOrEqual(1);

    const unfavoriteResponse = await request(app.getHttpServer())
      .delete(`/users/cats/${testCatId}/favorite`)
      .set('Authorization', `Bearer ${token}`);

    expect(unfavoriteResponse.status).toBe(200);
    expect(unfavoriteResponse.body.data.favoritedCats.length).toBeLessThanOrEqual(0)
  });

  it('should delete the cat as admin', async () => {
    const catResponse = await request(app.getHttpServer())
      .get('/cats/1');
    expect(catResponse.status).toBe(200);
    // Login the admin user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    const token = loginResponse.body.data.accessToken;

    const deleteCatResponse = await request(app.getHttpServer())
      .delete(`/cats/1`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteCatResponse.status).toBe(200);

    const catResponseNoCat = await request(app.getHttpServer())
      .get('/cats/1');

    expect(catResponseNoCat.status).toBe(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
