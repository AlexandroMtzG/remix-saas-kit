import { PrismaClient, Tenant, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TenantUserJoined } from "~/application/enums/core/tenants/TenantUserJoined";
import { TenantUserRole } from "~/application/enums/core/tenants/TenantUserRole";
import { TenantUserStatus } from "~/application/enums/core/tenants/TenantUserStatus";
import { UserType } from "~/application/enums/core/users/UserType";
const db = new PrismaClient();

async function createUser(firstName: string, lastName: string, email: string, password: string, type: UserType) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      avatar: "",
      type,
      firstName,
      lastName,
      phone: "",
    },
  });
  return user;
}

async function createTenant(name: string, workspaces: string[], users: (User & { role: TenantUserRole })[]) {
  const tenant = await db.tenant.create({
    data: {
      name,
      subscriptionCustomerId: "",
    },
  });

  // await db.tenantFeatures.create({
  //   data: {
  //     tenantId: tenant.id,
  //     maxWorkspaces: 3,
  //     maxUsers: 5,
  //     maxLinks: 45,
  //     maxStorage: 100 * 1024,
  //     monthlyContracts: 45,
  //   },
  // });

  users.forEach(async (user) => {
    await db.tenantUser.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: user.role,
        joined: TenantUserJoined.CREATOR,
        status: TenantUserStatus.ACTIVE,
        // current: false,
      },
    });
  });

  workspaces.forEach(async (name) => {
    const workspace = await db.workspace.create({
      data: {
        tenantId: tenant.id,
        name,
        type: 0,
        businessMainActivity: "",
        registrationNumber: "",
      },
    });

    users.forEach(async (user) => {
      await db.workspaceUser.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          // current: false,
        },
      });
    });
  });

  return tenant;
}

async function seed() {
  const adminEmail = process.env.REMIX_ADMIN_EMAIL?.toString();
  const adminPassword = process.env.REMIX_ADMIN_PASSWORD?.toString();
  if (!adminEmail || !adminPassword) {
    throw new Error("REMIX_ADMIN_EMAIL and REMIX_ADMIN_PASSWORD must be set");
  }
  const admin = await createUser("Admin", "User", adminEmail, adminPassword, UserType.Admin);
  const user1 = await createUser("John", "Doe", "john.doe@company.com", "password", UserType.Tenant);
  const user2 = await createUser("Luna", "Davis", "luna.davis@company.com", "password", UserType.Tenant);

  await createTenant(
    "Tenant 1",
    ["T1.Workspace 1", "T1.Workspace 2"],
    [
      { ...admin, role: TenantUserRole.OWNER },
      { ...user1, role: TenantUserRole.ADMIN },
      { ...user2, role: TenantUserRole.MEMBER },
    ]
  );
  await createTenant(
    "Tenant 2",
    ["T2.Workspace 1", "T2.Workspace 2"],
    [
      { ...user1, role: TenantUserRole.OWNER },
      { ...user2, role: TenantUserRole.MEMBER },
    ]
  );

  await Promise.all(
    getJokes().map((joke) => {
      const data = { jokesterId: admin.id, ...joke };
      return db.joke.create({ data });
    })
  );
}

seed();

function getJokes() {
  // shout-out to https://icanhazdadjoke.com/

  return [
    {
      name: "Road worker",
      content: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
    },
    {
      name: "Frisbee",
      content: `I was wondering why the frisbee was getting bigger, then it hit me.`,
    },
    {
      name: "Trees",
      content: `Why do trees seem suspicious on sunny days? Dunno, they're just a bit shady.`,
    },
    {
      name: "Skeletons",
      content: `Why don't skeletons ride roller coasters? They don't have the stomach for it.`,
    },
    {
      name: "Hippos",
      content: `Why don't you find hippopotamuses hiding in trees? They're really good at it.`,
    },
    {
      name: "Dinner",
      content: `What did one plate say to the other plate? Dinner is on me!`,
    },
    {
      name: "Elevator",
      content: `My first time using an elevator was an uplifting experience. The second time let me down.`,
    },
  ];
}
