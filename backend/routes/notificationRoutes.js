const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router
  .route('/')
  .post(notificationController.getAllNotifications)
  .delete(notificationController.deleteNotification)
  .patch(notificationController.markOneNotificationasread);

router
  .route('/all')
  .delete(notificationController.deleteAllNotifications)
  .patch(notificationController.markAllNotificationsAsRead);

module.exports = router;