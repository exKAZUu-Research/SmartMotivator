// @flow

import * as storage from './typed_storage';
import { BoolMapper, DateMapper } from './storage_mapper/';

export async function migrate() {
  let ver = await storage.migrationVersion.getNonNull();

  if (ver < 2) {
    ver = 2;
    const useAlarm = new BoolMapper('AlarmConfigScreen.useAlarm');
    if (await useAlarm.get()) {
      const alarmTime = new DateMapper('AlarmConfigScreen.reminderTime');
      const d = await alarmTime.get();
      if (d) {
        storage.alarmTimeList.set([d]);
      }
      alarmTime.remove();
    }
    useAlarm.remove();
  }
  await storage.migrationVersion.set(ver);
}
