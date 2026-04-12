import Yauzl from 'yauzl';
import Concat from 'concat-stream';
import { getPackageInfo } from './getPackageInfo.js';

export function getPackageInfoFromZip(pkg) {
  return new Promise((resolve, reject) => {
    Yauzl.open(pkg, (err, zipfile) => {
      if (err) {
        return reject(err);
      }

      let packageInfoFound = false;
      zipfile
        .on('entry', (entry) => {
          if (entry.fileName !== 'PaketoInfo.xml') {
            return;
          }

          packageInfoFound = true;
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              return reject(err);
            }

            readStream.on('error', reject).pipe(
              Concat((data) => {
                getPackageInfo(data.toString()).then(resolve).catch(reject);
              }),
            );
          });
        })
        .on('error', reject)
        .on('end', () => {
          if (!packageInfoFound) {
            reject(new Error(`No PaketoInfo.xml in ${pkg}`));
          }
        });
    });
  });
}
