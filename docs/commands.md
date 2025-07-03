
# Project commands

## new nest project

```bash
nest new <project-name>
```

## run nest project

```bash
npm run start:dev
```

## new nest module

```bash
nest generate module <module-name>
```

<!-- cloudinary -->
## cloudinary setup

```bash
pnpm install @nestjs/platform-express multer multer-storage-cloudinary cloudinary

pnpm install @nestjs/config dotenv
```

<!-- sockets -->
```bash
pnpm install @nestjs/websockets @nestjs/platform-socket.io socket.io
pnpm install --save-dev @types/socket.io
```

<!-- database -->
## database setup

```bash
pnpm install --save @nestjs/typeorm typeorm mysql2
pnpm install pg --save
```

## class validator

```bash
pnpm i --save class-validator class-transformer
```


<!-- swagger documentation -->
## swagger setup

```bash
pnpm install --save @nestjs/swagger
```


<!-- password hashing -->
## password hashing

```bash
pnpm install bcrypt @types/bcrypt
```

<!-- redis caching -->
## redis caching

```bash
 pnpm install @nestjs/cache-manager cache-manager @keyv/redis cacheable
    pnpm install @nestjs/redis ioredis
    ```