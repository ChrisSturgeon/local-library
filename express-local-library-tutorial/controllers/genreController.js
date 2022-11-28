const Genre = require('../models/genre');
const Book = require('../models/book');
const async = require('async');
const { body, validationResult } = require('express-validator');
const author = require('../models/author');

// Display list of all Genre.
exports.genre_list = function (req, res, next) {
  Genre.find()
    .sort({ name: 1 })
    .exec(function (err, list_genre) {
      if (err) {
        return next(err);
      }
      res.render('genre_list', {
        title: 'Genre List',
        genres: list_genre,
      });
    });
};
// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error('Genre not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render('genre_detail', {
        title: 'Genre Detail',
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitise the name field.
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  // Process the request after validation and santisation
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors so render the form again with sanitised values & errors
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from the form is valid.
      // Check is a genre with the same name already exists
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre already exists so just redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved so redirect to its detail page
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genres_books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre === null) {
        // There is no such genre so forward to genres
        res.redirect('/catalog/genres');
      }
      // Successfull so render delete page
      res.render('genre_delete', {
        title: 'Delete Genre',
        genre: results.genre,
        genres_books: results.genres_books,
      });
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.body.genreid).exec(callback);
      },
      genres_books(callback) {
        Book.find({ genre: req.body.genreid }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      if (results.genres_books.length > 0) {
        // Genre has books so cannot be deleted.
        // Instead, render in the same way as GET Route
        res.render('genre_delete', {
          title: 'Delete Genre',
          genre: results.genre,
          genres_books: results.genres_books,
        });
        return;
      }
      // Genre has no books. Delete object and redirect to list of genres
      Genre.findByIdAndRemove(req.body.genreid, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to genre list
        res.redirect('/catalog/genres');
      });
    }
  );
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id).exec((err, genre) => {
    if (err) {
      return next(err);
    }
    if (genre === null) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }
    // Success
    // Return form with genre name
    res.render('genre_form', {
      title: 'Update Genre',
      genre: genre,
    });
  });
};

// Handle Genre update on POST.
exports.genre_update_post = [
  // Validate and sanitise the name field.
  body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),

  // Process the request after validation and santisation
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data
    const genre = new Genre({ name: req.body.name, _id: req.params.id });

    if (!errors.isEmpty()) {
      // There are errors so render the form again with sanitised values & errors
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from the form is valid.
      // Check is a genre with the same name already exists
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre already exists so just redirect to its detail page
          res.redirect(found_genre.url);
        } else {
          Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, thegenre) => {
            if (err) {
              return next(err);
            }
            // Successfully updated so redirec genre page
            res.redirect(thegenre.url);
          });
        }
      });
    }
  },
];
