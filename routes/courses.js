var express = require("express");
var router = express.Router();
let { User } = require("../models");
let { Course } = require("../models");
const { asyncHandler } = require("../middleware/async-handler");
const { authenticateUser } = require("../middleware/auth-user");

router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
        },
      ],
    });
    res.status(200).json(courses);
  })
);

router.get(
  "/courses/:id",
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.findOne({
        where: { id: req.params.id },
        include: [
          {
            model: User,
          },
        ],
      });

      if (course) {
        res.status(200).json(course);
      } else {
        res.status(404).json({ msg: "Failed to retrieve user" });
      }
    } catch (error) {
      throw error;
    }
  })
);

router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      let course = await Course.create(req.body);
      res.location("/courses/" + course.id);
      res.status(201).end();
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let currUser = req.currentUser;
    let course = await Course.findByPk(req.params.id);

    try {
      if (course && course.userId === currUser.id) {
        course.title = req.body.title;
        course.description = req.body.description;
        course.estimatedTime = req.body.estimatedTime;
        course.materialsNeeded = req.body.materialsNeeded;

        await course.save();
        res.status(204).end();
      }
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    let currUser = req.currentUser;
    const course = await Course.findOne({ where: { id: req.params.id } });

    if (course.userId === currUser.id) {
      await course.destroy();
      res.status(204).end();
    }
  })
);

module.exports = router;
