import { startExpedition } from './state'
import { walkName } from './naming'

/**
 * Starting a walk from anywhere goes through here: the tap is also the gesture
 * iOS needs before it will even consider notifications, and every walk should
 * get the same kind of name.
 */
export function beginWalk(parkId: string, parkName: string) {
  if ('Notification' in window && Notification.permission === 'default')
    void Notification.requestPermission().catch(() => {})
  startExpedition(parkId, walkName(parkName))
}
