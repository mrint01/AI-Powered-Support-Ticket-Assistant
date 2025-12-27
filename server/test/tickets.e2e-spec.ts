import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as session from 'express-session';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TicketsModule } from '../src/tickets/tickets.module';
import { Ticket, TicketPriority } from '../src/entities/ticket.entity';
import { User, UserRole } from '../src/entities/user.entity';
import { AIResult, PriorityLevel } from '../src/entities/ai_result.entity';
import { TicketStatusHistory } from '../src/entities/ticket_status_history.entity';
import { Message } from '../src/entities/message.entity';
import { OpenAIService } from '../src/openai.service';
import { MessagesModule } from '../src/messages/messages.module';
import { UsersModule } from '../src/users/users.module';
import axios from 'axios';
import * as bcrypt from 'bcryptjs';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TicketsController (e2e)', () => {
  let app: INestApplication;
  let ticketRepository: Repository<Ticket>;
  let userRepository: Repository<User>;
  let aiResultRepository: Repository<AIResult>;
  let testUser: User;
  let testAdmin: User;

  // Mock OpenAI Service
  const mockOpenAIService = {
    prioritizeAndSummarize: jest.fn().mockResolvedValue({
      priority: 'medium',
      summary: 'Test ticket summary',
      suggested_response: 'This is a test suggested response',
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Ticket, User, AIResult, TicketStatusHistory, Message],
          synchronize: true,
          dropSchema: true,
        }),
        TicketsModule,
        MessagesModule,
        UsersModule,
        TypeOrmModule.forFeature([
          Ticket,
          User,
          AIResult,
          TicketStatusHistory,
          Message,
        ]),
      ],
    })
      .overrideProvider(OpenAIService)
      .useValue(mockOpenAIService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Set up session middleware with MemoryStore for testing
    const MemoryStore = require('memorystore')(session);
    app.use(
      session({
        store: new MemoryStore({
          checkPeriod: 86400000,
        }),
        secret: 'test-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        },
      }),
    );

    app.setGlobalPrefix('api');
    await app.init();

    // Get repositories
    ticketRepository = moduleFixture.get<Repository<Ticket>>(
      getRepositoryToken(Ticket),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    aiResultRepository = moduleFixture.get<Repository<AIResult>>(
      getRepositoryToken(AIResult),
    );

    // Create test user with hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = userRepository.create({
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: UserRole.USER,
    });
    testUser = await userRepository.save(testUser);

    // Create test admin
    const adminHashedPassword = await bcrypt.hash('password123', 10);
    testAdmin = userRepository.create({
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminHashedPassword,
      role: UserRole.ADMIN,
    });
    testAdmin = await userRepository.save(testAdmin);

    // Mock axios post for Spring Boot calls
    mockedAxios.post.mockResolvedValue({ data: {} });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await ticketRepository.clear();
    await aiResultRepository.clear();
    // Reset mocks
    jest.clearAllMocks();
    mockOpenAIService.prioritizeAndSummarize.mockResolvedValue({
      priority: 'medium',
      summary: 'Test ticket summary',
      suggested_response: 'This is a test suggested response',
    });
    mockedAxios.post.mockResolvedValue({ data: {} });
  });

  describe('POST /api/tickets', () => {
    it('should create a ticket successfully when authenticated', async () => {
      const agent = request.agent(app.getHttpServer());

      // Login first to get session
      await agent
        .post('/api/users/login')
        .send({
          identifier: 'testuser',
          password: 'password123',
        })
        .expect(201);

      const createTicketDto = {
        title: 'Test Ticket Title',
        description: 'This is a test description for the ticket',
      };

      const response = await agent
        .post('/api/tickets')
        .send(createTicketDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(createTicketDto.title);
      expect(response.body.description).toBe(createTicketDto.description);
      expect(response.body.priority).toBe('medium'); // From mocked OpenAI
      expect(mockOpenAIService.prioritizeAndSummarize).toHaveBeenCalledWith(
        createTicketDto.title,
        createTicketDto.description,
      );
    });

    it('should return 401 if not authenticated', async () => {
      const createTicketDto = {
        title: 'Test Ticket Title',
        description: 'This is a test description for the ticket',
      };

      await request(app.getHttpServer())
        .post('/api/tickets')
        .send(createTicketDto)
        .expect(401);
    });

    it('should validate title is required', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const createTicketDto = {
        description: 'This is a test description for the ticket',
      };

      await agent.post('/api/tickets').send(createTicketDto).expect(400);
    });

    it('should validate title min length', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const createTicketDto = {
        title: 'AB', // Less than 3 characters
        description: 'This is a test description for the ticket',
      };

      await agent.post('/api/tickets').send(createTicketDto).expect(400);
    });

    it('should validate title max length', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const createTicketDto = {
        title: 'A'.repeat(201), // More than 200 characters
        description: 'This is a test description for the ticket',
      };

      await agent.post('/api/tickets').send(createTicketDto).expect(400);
    });

    it('should validate description is required', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const createTicketDto = {
        title: 'Test Ticket Title',
      };

      await agent.post('/api/tickets').send(createTicketDto).expect(400);
    });

    it('should validate description min length', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const createTicketDto = {
        title: 'Test Ticket Title',
        description: 'Short', // Less than 10 characters
      };

      await agent.post('/api/tickets').send(createTicketDto).expect(400);
    });

    it('should validate description max length', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const createTicketDto = {
        title: 'Test Ticket Title',
        description: 'A'.repeat(5001), // More than 5000 characters
      };

      await agent.post('/api/tickets').send(createTicketDto).expect(400);
    });

    it('should reject non-whitelisted properties', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const createTicketDto = {
        title: 'Test Ticket Title',
        description: 'This is a test description for the ticket',
        status: 'closed', // Not allowed
        priority: 'high', // Not allowed
      };

      await agent.post('/api/tickets').send(createTicketDto).expect(400);
    });
  });

  describe('GET /api/tickets', () => {
    beforeEach(async () => {
      // Create test tickets
      const ticket1 = ticketRepository.create({
        title: 'Ticket 1',
        description: 'Description 1',
        priority: TicketPriority.HIGH,
        user: testUser,
      });
      await ticketRepository.save(ticket1);

      const ticket2 = ticketRepository.create({
        title: 'Ticket 2',
        description: 'Description 2',
        priority: TicketPriority.LOW,
        user: testUser,
      });
      await ticketRepository.save(ticket2);
    });

    it('should return all tickets for admin', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'admin',
        password: 'password123',
      });

      const response = await agent.get('/api/tickets').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should return only user tickets for regular user', async () => {
      // Create another user with a ticket
      const otherUser = userRepository.create({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        role: UserRole.USER,
      });
      await userRepository.save(otherUser);

      const otherTicket = ticketRepository.create({
        title: 'Other Ticket',
        description: 'Other description',
        priority: TicketPriority.MEDIUM,
        user: otherUser,
      });
      await ticketRepository.save(otherTicket);

      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const response = await agent.get('/api/tickets').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should only get testUser's tickets (2), not otherUser's
      const userTicketIds = response.body.map(
        (t: any) => t.user?.id || t.userId,
      );
      userTicketIds.forEach((userId: number) => {
        expect(userId).toBe(testUser.id);
      });
    });

    it('should return 401 if not authenticated', async () => {
      await request(app.getHttpServer()).get('/api/tickets').expect(401);
    });
  });

  describe('GET /api/tickets/:id', () => {
    it('should return a ticket by id', async () => {
      const ticket = ticketRepository.create({
        title: 'Test Ticket',
        description: 'Test Description',
        priority: TicketPriority.MEDIUM,
        user: testUser,
      });
      const savedTicket = await ticketRepository.save(ticket);

      const response = await request(app.getHttpServer())
        .get(`/api/tickets/${savedTicket.id}`)
        .expect(200);

      expect(response.body.id).toBe(savedTicket.id);
      expect(response.body.title).toBe(savedTicket.title);
    });
  });

  describe('PATCH /api/tickets/:id', () => {
    let ticket: Ticket;

    beforeEach(async () => {
      ticket = ticketRepository.create({
        title: 'Original Title',
        description: 'Original Description',
        priority: TicketPriority.LOW,
        user: testUser,
      });
      ticket = await ticketRepository.save(ticket);
    });

    it('should update ticket successfully', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const updateDto = {
        title: 'Updated Title',
        status: 'in progress',
      };

      const response = await agent
        .patch(`/api/tickets/${ticket.id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.affected).toBeGreaterThan(0);

      // Verify update
      const updatedTicket = await ticketRepository.findOne({
        where: { id: ticket.id },
      });
      expect(updatedTicket?.title).toBe(updateDto.title);
    });

    it('should return 401 if not authenticated', async () => {
      const updateDto = {
        title: 'Updated Title',
      };

      await request(app.getHttpServer())
        .patch(`/api/tickets/${ticket.id}`)
        .send(updateDto)
        .expect(401);
    });

    it('should validate enum values for status', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const updateDto = {
        status: 'invalid_status',
      };

      await agent
        .patch(`/api/tickets/${ticket.id}`)
        .send(updateDto)
        .expect(400);
    });

    it('should validate enum values for priority', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const updateDto = {
        priority: 'invalid_priority',
      };

      await agent
        .patch(`/api/tickets/${ticket.id}`)
        .send(updateDto)
        .expect(400);
    });
  });

  describe('DELETE /api/tickets/:id', () => {
    it('should delete a ticket', async () => {
      const agent = request.agent(app.getHttpServer());

      await agent.post('/api/users/login').send({
        identifier: 'testuser',
        password: 'password123',
      });

      const ticket = ticketRepository.create({
        title: 'Ticket to Delete',
        description: 'Description',
        priority: TicketPriority.LOW,
        user: testUser,
      });
      const savedTicket = await ticketRepository.save(ticket);

      await agent.delete(`/api/tickets/${savedTicket.id}`).expect(200);

      const deletedTicket = await ticketRepository.findOne({
        where: { id: savedTicket.id },
      });
      expect(deletedTicket).toBeNull();
    });
  });

  describe('GET /api/tickets/:id/history', () => {
    it('should return ticket status history', async () => {
      const ticket = ticketRepository.create({
        title: 'Test Ticket',
        description: 'Description',
        priority: TicketPriority.LOW,
        user: testUser,
      });
      const savedTicket = await ticketRepository.save(ticket);

      const response = await request(app.getHttpServer())
        .get(`/api/tickets/${savedTicket.id}/history`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/tickets/:id/ai-suggestion', () => {
    it('should return AI suggested response', async () => {
      const ticket = ticketRepository.create({
        title: 'Test Ticket',
        description: 'Description',
        priority: TicketPriority.LOW,
        user: testUser,
      });
      const savedTicket = await ticketRepository.save(ticket);

      // Create AI result
      const aiResult = aiResultRepository.create({
        ticket: savedTicket,
        summary: 'Test summary',
        priority: PriorityLevel.MEDIUM,
        suggested_response: 'Test suggested response',
      });
      await aiResultRepository.save(aiResult);

      const response = await request(app.getHttpServer())
        .get(`/api/tickets/${savedTicket.id}/ai-suggestion`)
        .expect(200);

      expect(response.body).toHaveProperty('suggested_response');
      expect(response.body.suggested_response).toBe('Test suggested response');
    });

    it('should return null if no AI suggestion exists', async () => {
      const ticket = ticketRepository.create({
        title: 'Test Ticket',
        description: 'Description',
        priority: TicketPriority.LOW,
        user: testUser,
      });
      const savedTicket = await ticketRepository.save(ticket);

      const response = await request(app.getHttpServer())
        .get(`/api/tickets/${savedTicket.id}/ai-suggestion`)
        .expect(200);

      expect(response.body.suggested_response).toBeNull();
    });
  });
});
