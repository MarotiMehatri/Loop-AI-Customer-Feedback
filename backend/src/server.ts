import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/prisma.js";
import { Prisma } from "./generated/prisma/client.js";
import { log } from "node:console";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

//Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Server test route

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Loop AI Node.js server is running successfully!",
  });
});

//Database connection test
app.get("/api/database-status", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "PostgreSQL database connected successfully!",
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "PstgreSQL database connection failed.",
    });
  }
});

//create usre
app.post("/api/users", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
      return;
    }

    const existingUsre = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUsre) {
      res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
      return;
    }

    const usre = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: role || "VIEWER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Usre create successsfully.",
      data: usre,
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create user.",
    });
  }
});

//Get all users
app.get("/api/users", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch users.",
    });
  }
});

//Get one user
app.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch user.",
    });
  }
});

//Update user
app.put("/api/users/id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { name, email, role } = req.body;

    if (Number.isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
      return;
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
        email,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "User update successfull.",
      data: user,
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update user.",
    });
  }
});

//Delete user
app.delete("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
      return;
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Usre delete successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete user",
    });
  }
});

//Invalid route
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

//Global error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();

    console.log("PostgreSQL connect successfull.");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost: ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
};

const shutdownServer = async (): Promise<void> => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdownServer);
process.on("SIGTERT", shutdownServer);

startServer();
