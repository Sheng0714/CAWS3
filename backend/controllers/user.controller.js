const db = require('../models');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const readXlsxFile = require("read-excel-file/node");
const { Client } = require("@notionhq/client");

// Assigning users to the variable User
const User = db.User;
const Profile = db.Profile;
const UserProfile = db.UserProfile;
const Activity = db.Activity;
const UserActivityGroup = db.UserActivityGroup;
const LoginHistory = db.LoginHistory;
const { Op } = db.Sequelize;

const STUDENT_TZ = "Asia/Taipei";
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: STUDENT_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DAY_LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: STUDENT_TZ,
  weekday: "short",
});

const normalizeNameKey = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const toDateKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return DATE_KEY_FORMATTER.format(date);
};

const buildDateKeys = (days) => {
  const safeDays = Math.min(30, Math.max(1, Number(days) || 7));
  const list = [];
  const now = new Date();

  for (let index = safeDays - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    list.push({
      dateKey: toDateKey(date),
      dayLabel: DAY_LABEL_FORMATTER.format(date),
    });
  }

  return list;
};

const splitEnvList = (value, fallback) =>
  String(value || fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const NOTION_ACCOUNT_FIELD_ALIASES = splitEnvList(
  process.env.NOTION_LOGIN_ACCOUNT_FIELDS,
  "帳號,账号,Account,account,Email,email,信箱,電子信箱"
);
const NOTION_PASSWORD_FIELD_ALIASES = splitEnvList(
  process.env.NOTION_LOGIN_PASSWORD_FIELDS,
  "密碼,密码,Password,password"
);
const NOTION_NAME_FIELD_ALIASES = splitEnvList(
  process.env.NOTION_LOGIN_NAME_FIELDS,
  "姓名,名字,名稱,Name,name,學生姓名,studentName,Student Name"
);
const NOTION_SCHOOL_FIELD_ALIASES = splitEnvList(
  process.env.NOTION_LOGIN_SCHOOL_FIELDS,
  "學校,学校,School,school"
);
const NOTION_CITY_FIELD_ALIASES = splitEnvList(
  process.env.NOTION_LOGIN_CITY_FIELDS,
  "城市,縣市,City,city"
);

const isBcryptHash = (value) => /^\$2[aby]\$\d{2}\$/.test(String(value || ""));

let notionClient;
let notionLoginSchemaCache;

const getNotionClient = () => {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) return null;
  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return notionClient;
};

const normalizePropertyKey = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();

const getPlainTextFromRichTextArray = (items = []) =>
  items
    .map((item) => item?.plain_text || item?.text?.content || "")
    .join("")
    .trim();

const getDisplayValueFromNotionProperty = (property) => {
  if (!property) return "";

  switch (property.type) {
    case "title":
      return getPlainTextFromRichTextArray(property.title);
    case "rich_text":
      return getPlainTextFromRichTextArray(property.rich_text);
    case "email":
      return property.email || "";
    case "phone_number":
      return property.phone_number || "";
    case "url":
      return property.url || "";
    case "number":
      return property.number === null || property.number === undefined ? "" : String(property.number);
    case "select":
      return property.select?.name || "";
    case "formula":
      return getDisplayValueFromNotionProperty(property.formula);
    default:
      return "";
  }
};

const getPropertyByAliases = (properties = {}, aliases = []) => {
  const lookup = new Map(
    Object.entries(properties).map(([name, property]) => [normalizePropertyKey(name), { name, property }])
  );

  for (const alias of aliases) {
    const match = lookup.get(normalizePropertyKey(alias));
    if (match) return match;
  }

  return null;
};

const buildNotionEqualsFilter = (propertyName, propertyType, value) => {
  if (!propertyName || !propertyType) return null;

  switch (propertyType) {
    case "title":
      return { property: propertyName, title: { equals: value } };
    case "rich_text":
      return { property: propertyName, rich_text: { equals: value } };
    case "email":
      return { property: propertyName, email: { equals: value } };
    case "phone_number":
      return { property: propertyName, phone_number: { equals: value } };
    case "url":
      return { property: propertyName, url: { equals: value } };
    case "number": {
      const numberValue = Number(value);
      return Number.isFinite(numberValue)
        ? { property: propertyName, number: { equals: numberValue } }
        : null;
    }
    default:
      return null;
  }
};

const getNotionLoginSchema = async () => {
  const notion = getNotionClient();
  if (!notion) return null;
  if (notionLoginSchemaCache) return notionLoginSchemaCache;

  const database = await notion.databases.retrieve({
    database_id: process.env.NOTION_DATABASE_ID,
  });
  notionLoginSchemaCache = database?.properties || {};
  return notionLoginSchemaCache;
};

const findNotionLoginPage = async (account) => {
  const notion = getNotionClient();
  if (!notion || !account) return null;

  const schema = await getNotionLoginSchema();
  const accountProperty = getPropertyByAliases(schema, NOTION_ACCOUNT_FIELD_ALIASES);
  if (!accountProperty) {
    console.warn("Notion login account field not found. Expected one of:", NOTION_ACCOUNT_FIELD_ALIASES.join(", "));
    return null;
  }

  const filter = buildNotionEqualsFilter(
    accountProperty.name,
    accountProperty.property?.type,
    account
  );

  if (filter) {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter,
      page_size: 1,
    });
    return response.results?.[0] || null;
  }

  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    page_size: 100,
  });

  return (
    response.results.find((page) => {
      const pageAccount = getDisplayValueFromNotionProperty(
        getPropertyByAliases(page?.properties, NOTION_ACCOUNT_FIELD_ALIASES)?.property
      );
      return pageAccount === account;
    }) || null
  );
};

const authenticateWithNotion = async ({ account, password }) => {
  if (!account || !password || !getNotionClient()) return null;

  const page = await findNotionLoginPage(account);
  if (!page) return null;

  const properties = page.properties || {};
  const passwordProperty = getPropertyByAliases(properties, NOTION_PASSWORD_FIELD_ALIASES);
  const storedPassword = getDisplayValueFromNotionProperty(passwordProperty?.property);

  if (!storedPassword) return null;

  const isPasswordValid = isBcryptHash(storedPassword)
    ? await bcrypt.compare(password, storedPassword)
    : String(password) === storedPassword;

  if (!isPasswordValid) return null;

  const accountValue =
    getDisplayValueFromNotionProperty(
      getPropertyByAliases(properties, NOTION_ACCOUNT_FIELD_ALIASES)?.property
    ) || account;
  const name =
    getDisplayValueFromNotionProperty(
      getPropertyByAliases(properties, NOTION_NAME_FIELD_ALIASES)?.property
    ) || accountValue;
  const school =
    getDisplayValueFromNotionProperty(
      getPropertyByAliases(properties, NOTION_SCHOOL_FIELD_ALIASES)?.property
    ) || "Notion";
  const city =
    getDisplayValueFromNotionProperty(
      getPropertyByAliases(properties, NOTION_CITY_FIELD_ALIASES)?.property
    ) || "Notion";

  return {
    account: accountValue,
    name,
    school,
    city,
    passwordHash: isBcryptHash(storedPassword)
      ? storedPassword
      : await bcrypt.hash(password, 10),
  };
};

const syncNotionUserToLocalDb = async (notionUser) => {
  let user = await User.findOne({
    where: { email: notionUser.account },
  });

  if (!user) {
    return User.create({
      name: notionUser.name,
      email: notionUser.account,
      password: notionUser.passwordHash,
      school: notionUser.school,
      city: notionUser.city,
    });
  }

  user.name = notionUser.name || user.name;
  user.password = notionUser.passwordHash;
  user.school = notionUser.school || user.school;
  user.city = notionUser.city || user.city;
  await user.save();
  return user;
};

const sendLoginSuccess = async (res, user, source = "web") => {
  try {
    await LoginHistory.create({
      userId: user.id,
      userName: user.name || "",
      loginAt: new Date(),
      source,
    });
  } catch (loginHistoryError) {
    console.error("Failed to write login history:", loginHistoryError?.message || loginHistoryError);
  }

  const authorizedInfo = await getAuthorized(user.id);

  const jwtPayload = { ...user, ...authorizedInfo };
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: 1 * 24 * 60 * 60 * 1000,
  });

  res.cookie("jwt", token, {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });

  const userWithoutPassword = { ...user.dataValues, jwtToken: token };
  delete userWithoutPassword.password;
  return res.status(200).send(userWithoutPassword);
};


// signing a user up
// hashing users password before its saved to the database with bcrypt
exports.signup = async (req, res) => {
  try {
    const { name, email, password, passwordConf, school, city } = req.body;
    
    // Check if password and passwordConf match
    if (password !== passwordConf) {
      return res.status(400).send("Password and password confirmation do not match.");
    }
    
    const data = {
      name,
      email,
      password: await bcrypt.hash(password, 10),
      school,
      city
    };

    //saving the user
    const user = await User.create(data);
 
    //if user details is captured
    //generate token with the user's id and the secretKey in the env file
    // set cookie with the token generated
    if (user) {
      console.log("JWT_SECRET:", process.env.JWT_SECRET);
      let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: 1 * 24 * 60 * 60 * 1000,
      });
 
      res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
      // console.log("user", JSON.stringify(user, null, 2));
      // console.log(token);
      //send users details
      return res.status(201).send(user);
    } else {
      return res.status(409).send("Details are not correct");
    }
  } catch (error) {
    // console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

exports.batchRegistration = async (req, res) => {
  console.log("Batch registration process started...");
  try {
    if (!req.file) {
      console.error("No file uploaded!");
      return res.status(400).send("Please upload an Excel file!");
    }

    const path = __basedir + "/uploads/" + req.file.filename;
    console.log(`File uploaded to path: ${path}`);

    const rows = await readXlsxFile(path);
    console.log("File successfully read. Total rows:", rows.length);

    // Skip header row
    rows.shift();
    console.log("Header row skipped. Processing rows...");

    let users = [];
    let profiles = [];

    // Process each row and prepare user & profile data
    for (const [index, row] of rows.entries()) {
      console.log(`Processing row ${index + 1}:`, row);
      console.log(`Row ${index + 1} field types:`, row.map(value => typeof value));

      if (row.length < 9) {
        console.error(`Row ${index + 1} has insufficient columns:`, row);
        return res.status(400).send({
          message: `Row ${index + 1} has insufficient columns.`,
          row,
        });
      }

      try {
         // 額外檢查數據有效性
        if (!row[2] || typeof row[2] !== "number" && typeof row[2] !== "string") {
          throw new Error(`Invalid password format for row ${index + 1}: ${row[2]}`);
        }

        const password = String(row[2]); // 將密碼轉換為字符串
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log(`Hashed password for row ${index + 1}:`, hashedPassword);
        let user = {
          name: row[0],
          email: row[1],
          password: hashedPassword,
          school: row[3],
          city: row[4],
        };

        users.push(user);
      } catch (err) {
        console.error(`Error processing row ${index + 1}:`, err.message);
        return res.status(400).send({
          message: `Error processing row ${index + 1}`,
          error: err.message,
        });
      }
    }

    console.log("Users to be created:", users);

    await User.bulkCreate(users)
      .then(async (createdUsers) => {
        console.log("Users successfully created. Total:", createdUsers.length);

        for (let i = 0; i < createdUsers.length; i++) {
          const profileData = {
            userId: createdUsers[i].dataValues.id,
            className: rows[i][5],
            studentId: rows[i][6] ? String(rows[i][6]) : null, // 確保是字串
            year: rows[i][7] ? String(rows[i][7]) : null,     // 確保是字串
            sex: rows[i][8],
          };

          console.log(`Profile data for row ${i + 1}:`, profileData);

          profiles.push(profileData);
        }

        console.log("Profiles to be created:", profiles);

        await Profile.bulkCreate(profiles)
          .then(async (createdProfiles) => {
            console.log("Profiles successfully created. Total:", createdProfiles.length);

            for (let i = 0; i < createdProfiles.length; i++) {
              await UserProfile.create({
                UserId: createdUsers[i].dataValues.id,
                ProfileId: createdProfiles[i].dataValues.id,
              });
              console.log(`UserProfile linked for User ID ${createdUsers[i].dataValues.id}`);
            }

            res.status(200).send({
              message: "批次註冊成功！" ,
            });
          })
          .catch((err) => {
            console.error("Error creating profiles:", err.message);
            res.status(400).send({
              message: "Error creating profiles",
              error: err.message,
            });
          });
      })
      .catch((err) => {
        console.error("Error creating users:", {
          message: err.message,
          stack: err.stack,
          users,
        });
        res.status(500).send({
          message: "The data import failed. Please check whether there is a duplicate registration issue.",
          error: err.message,
        });
      });
  } catch (error) {
    console.error("Batch registration error:", error.message);
    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}`,
      error: error.message,
      stack: error.stack,
    });
  }
};

// Private function to validate email format
const getAuthorized = async (userId) => {
  const haveActivities = await Activity
      .findAll({
        where: {
          userId: userId
        }
      })
      .then((data) => { return { "haveActivities": data.map(element => element.id) }});
    
    // got user's activity joined
  const inRooms = await UserActivityGroup
    .findAll({
      where: {
        UserId: userId
      }
    }).then((data) => { return { "inRooms": data.map(element => element.ActivityGroupId) }});
    
  return {...haveActivities, ...inRooms}
}

exports.login = async (req, res) => {
  try {
    const account = String(req.body?.email || "").trim();
    const password = String(req.body?.password || "");

    if (!account || !password) {
      return res.status(401).send("Authentication failed");
    }

    try {
      const notionUser = await authenticateWithNotion({ account, password });
      if (notionUser) {
        const syncedUser = await syncNotionUserToLocalDb(notionUser);
        return sendLoginSuccess(res, syncedUser, "notion");
      }
    } catch (notionLoginError) {
      console.error("Notion login failed:", notionLoginError?.message || notionLoginError);
    }
    
    //find a user by their email
    const user = await User.findOne({
      where: {
        email: account
      } 
    });

    
    if (!user) {
      return res.status(401).send("Authentication failed");
    }

    //if user email is found, compare password with bcrypt
    const isSame = await bcrypt.compare(password, user.password);
    // console.log('1')
    //if password is the same
      //generate token with the user's id and the secretKey in the env file

    if (!isSame) {
      return res.status(401).send("Authentication failed");
    }

    try {
      await LoginHistory.create({
        userId: user.id,
        userName: user.name || "",
        loginAt: new Date(),
        source: "web",
      });
    } catch (loginHistoryError) {
      console.error("Failed to write login history:", loginHistoryError?.message || loginHistoryError);
    }
    
    delete user.password;
    //got user's activity haved
    const authorizedInfo = await getAuthorized(user.id)

    let jwtPayload = {...user, ...authorizedInfo};
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    let token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: 1 * 24 * 60 * 60 * 1000,
    });

    // Set cookie with the token generated
    res.cookie("jwt", token, { 
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 天有效期
      httpOnly: true,                 // 禁止 JavaScript 訪問（防範 XSS 攻擊）
      secure: true,                   // 僅限 HTTPS 傳輸
      sameSite: "Strict"              // 防止 CSRF 攻擊
    });

    
    // Set cookie with the token generated
    // res.cookie("jwt", token, { maxAge: 1 * 24 * 60 * 60, httpOnly: true });
    
    // add jwtToken
    const userWithoutPassword = { ...user.dataValues, jwtToken: token };
    delete userWithoutPassword.password;

    
    
    // Send user details along with the token
    return res.status(200).send(userWithoutPassword);

  } catch (error) {
    res.status(500).send({
      message: "Could not log in process: " + error.toString(),
    });
  }
}

exports.getLoginTrendByStudents = async (req, res) => {
  try {
    const studentNamesRaw = Array.isArray(req.body?.studentNames) ? req.body.studentNames : [];
    const studentNames = [...new Set(studentNamesRaw.map((item) => String(item || "").trim()).filter(Boolean))];
    const dayWindow = Math.min(30, Math.max(1, Number(req.body?.days) || 7));

    if (studentNames.length === 0) {
      return res.status(200).send({
        success: true,
        data: {
          days: dayWindow,
          trend: buildDateKeys(dayWindow).map((item) => ({ date: item.dateKey, day: item.dayLabel, logins: 0, students: 0 })),
          matchedStudents: [],
          missingStudents: [],
          totalStudents: 0,
        },
      });
    }

    const users = await User.findAll({
      attributes: ["id", "name"],
      raw: true,
    });

    const usersByNormalizedName = new Map();
    users.forEach((user) => {
      const key = normalizeNameKey(user?.name);
      if (!key) return;
      if (!usersByNormalizedName.has(key)) {
        usersByNormalizedName.set(key, []);
      }
      usersByNormalizedName.get(key).push(user);
    });

    const matchedUsers = [];
    const missingStudents = [];

    studentNames.forEach((studentName) => {
      const matches = usersByNormalizedName.get(normalizeNameKey(studentName)) || [];
      if (matches.length === 0) {
        missingStudents.push(studentName);
        return;
      }
      matches.forEach((user) => matchedUsers.push(user));
    });

    const uniqueMatchedUsers = Array.from(new Map(matchedUsers.map((user) => [user.id, user])).values());
    const dateKeys = buildDateKeys(dayWindow);
    const zeroMap = Object.fromEntries(dateKeys.map((item) => [item.dateKey, 0]));

    if (uniqueMatchedUsers.length === 0) {
      return res.status(200).send({
        success: true,
        data: {
          days: dayWindow,
          trend: dateKeys.map((item) => ({ date: item.dateKey, day: item.dayLabel, logins: 0, students: 0 })),
          matchedStudents: [],
          missingStudents,
          totalStudents: studentNames.length,
        },
      });
    }

    const startAt = new Date();
    startAt.setHours(0, 0, 0, 0);
    startAt.setDate(startAt.getDate() - (dayWindow - 1));

    const loginRows = await LoginHistory.findAll({
      attributes: ["userId", "loginAt"],
      where: {
        userId: { [Op.in]: uniqueMatchedUsers.map((user) => user.id) },
        loginAt: { [Op.gte]: startAt },
      },
      raw: true,
    });

    const countByDay = { ...zeroMap };
    const uniqueUserIdsByDay = Object.fromEntries(dateKeys.map((item) => [item.dateKey, new Set()]));
    loginRows.forEach((row) => {
      const dateKey = toDateKey(row?.loginAt);
      if (!dateKey || !Object.prototype.hasOwnProperty.call(countByDay, dateKey)) return;
      countByDay[dateKey] += 1;
      uniqueUserIdsByDay[dateKey].add(Number(row.userId));
    });

    return res.status(200).send({
      success: true,
      data: {
        days: dayWindow,
        trend: dateKeys.map((item) => ({
          date: item.dateKey,
          day: item.dayLabel,
          logins: countByDay[item.dateKey] || 0,
          students: uniqueUserIdsByDay[item.dateKey]?.size || 0,
        })),
        matchedStudents: uniqueMatchedUsers.map((user) => user.name),
        missingStudents,
        totalStudents: studentNames.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch login trend by students:", error);
    return res.status(500).send({
      success: false,
      error: "Failed to fetch login trend.",
      details: error?.message || String(error),
    });
  }
};

// Retrieve all Users from the database.
exports.findAll = (req, res) => {
    // const activity = req.query.activity;
    // var condition = activity ? { activity: { [Op.iLike]: `%${activity}%` } } : null;
  
    User.findAll()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving users."
        });
      });
};

// Find a single User with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    if (req.user.dataValues.id !== id) {
      return res.status(403).send("You are not authorized to access this resource.");
    }

    User.findByPk(id)
      .then(data => {
        if (data) {
          
          let userWithoutPassword = { ...data.dataValues};
          delete userWithoutPassword.password;
          res.send(userWithoutPassword);
        } else {
          res.status(404).send({
            message: `Cannot find user with id=${id}.`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Error retrieving user with id=" + id
        });
      });
};

// Update a User by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;
  if (req.user.dataValues.id !== id) {
    return res.status(403).send("You are not authorized to access this resource.");
  }

  try {
      // 從請求中提取新資料
      const { name, email, password } = req.body;

      // 根據 ID 查找使用者
      const user = await User.findByPk(id);
      if (!user) {
          return res.status(404).send({ message: `Cannot find user with id=${id}.` });
      }

      // 更新姓名與 Email
      if (name) user.name = name;
      if (email) user.email = email;

      // 如果有新密碼，對密碼進行加密
      if (password) {
          user.password = await bcrypt.hash(password, 10); // 加密新密碼
      }

      // 保存更新後的使用者資料
      await user.save();

      res.send({ message: "User was updated successfully." });
  } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).send({
          message: "Error updating user with id=" + id,
      });
  }
};

// Delete a User with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    User.destroy({
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
            message: "User was deleted successfully!"
          });
        } else {
          res.send({
            message: `Cannot delete user with id=${id}. Maybe user was not found!`
          });
        }
      })
      .catch(err => {
        res.status(500).send({
          message: "Could not delete user with id=" + id
        });
      });
};

// Delete all Users from the database.
exports.deleteAll = (req, res) => {
    User.destroy({
        where: {},
        truncate: false
    })
    .then(nums => {
        res.send({ message: `${nums} users were deleted successfully!` });
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message || "Some error occurred while removing all users."
        });
    });
};

// renew user
exports.reNewToken = async (req, res) => {
  if (!req.user) {
    return res.status(401).send("Authentication failed");
  }
  const userId = req.user.dataValues.id;
  
  //find a user by their email
  const user = await User.findOne({
    where: {
      id: userId
    } 
  });
  if (!user) {
    return res.status(401).send("Authentication failed");
  }


  delete user.password;
  const authorizedInfo = await getAuthorized(user.id)

  let jwtPayload = {...user, ...authorizedInfo};
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  let token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
    expiresIn: 1 * 24 * 60 * 60 * 1000,
  });

  // add jwtToken
  const userWithoutPassword = { ...user.dataValues, jwtToken: token };
  
  // Set cookie with the token generated
  res.cookie("jwt", token, { 
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 天有效期
    httpOnly: true,                 // 禁止 JavaScript 訪問（防範 XSS 攻擊）
    secure: true,                   // 僅限 HTTPS 傳輸
    sameSite: "Strict"              // 防止 CSRF 攻擊
  });


  // Send user details along with the token
  return res.status(200).send(userWithoutPassword);
};
