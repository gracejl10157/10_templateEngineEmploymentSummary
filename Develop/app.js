const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const Promise = require("bluebird");

const Handlebars = require("handlebars");
const render = require("./lib/htmlRenderer");

const writeFile = (pathName, data) => {
  return new Promise((res, rej) => {
    const outputPath = __dirname + "/output";
    const path = outputPath + "/" + pathName;

    if (!fs.existsSync(outputPath)) {
      console.log("writing /output");
      fs.mkdirSync(outputPath);
    }

    fs.writeFile(path + ".html", data, err => {
      if (err) {
        console.log(err);
        return rej(err);
      }

      res();
    });
  });
};

function generateQuestion(input) {
  return {
    type: "input",
    name: input,
    message: "What is your " + input + "?"
  };
}

const employeeQuestions = [
  generateQuestion("name"),
  generateQuestion("id"),
  generateQuestion("email")
];

const managerQuestions = [
  ...employeeQuestions,
  generateQuestion("officeNumber")
];

const internQuestions = [...employeeQuestions, generateQuestion("school")];

const engineerQuestions = [...employeeQuestions, generateQuestion("github")];

const askEmployeeQuestions = () => {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "employeeType",
        message: "What is your role?",
        choices: ["Manager", "Engineer", "Intern"]
      }
    ])
    .then(answers => {
      console.log(answers);

      switch (answers.employeeType) {
        case "Manager":
          return inquirer.prompt(managerQuestions).then(answers => {
            return new Manager(
              answers.name,
              answers.id,
              answers.email,
              answers.officeNumber
            );
          });
        case "Engineer":
          return inquirer.prompt(engineerQuestions).then(answers => {
            return new Engineer(
              answers.name,
              answers.id,
              answers.email,
              answers.github
            );
          });
        case "Intern":
          return inquirer.prompt(internQuestions).then(answers => {
            return new Intern(
              answers.name,
              answers.id,
              answers.email,
              answers.school
            );
          });
      }
    });
};

inquirer
  .prompt([
    {
      type: "number",
      name: "numberOfEmployees",
      message: "How many employees?"
    }
  ])
  .then(answers => {
    console.log(answers);

    const emptyArray = new Array(answers.numberOfEmployees);

    return Promise.mapSeries(emptyArray, () => {
      return askEmployeeQuestions();
    });
  })
  .then(employees => {
    console.log(employees);
    const html = render(employees);
    return writeFile("main", html);
  });
