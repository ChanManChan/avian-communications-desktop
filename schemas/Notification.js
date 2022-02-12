const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
  userTo: { type: Schema.Types.ObjectId, ref: 'User' },
  userFrom: { type: Schema.Types.ObjectId, ref: 'User' },
  notificationType: String,
  opened: { type: Boolean, default: false },
  entityId: Schema.Types.ObjectId
}, { timestamps: true })

NotificationSchema.statics.insertNotification = async (userTo, userFrom, notificationType, entityId) => {
  const data = {
    userTo,
    userFrom,
    notificationType,
    entityId
  }
  
  await Notification.deleteOne(data).catch(e => console.error(e))
  return await Notification.create(data).catch(e => console.error(e))
}

const Notification = mongoose.model('Notification', NotificationSchema)
module.exports = Notification