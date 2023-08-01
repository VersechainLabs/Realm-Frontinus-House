import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { BlockchainService } from 'src/blockchain/blockchain.service';

@Processor('audio')
export class AudioProcessor {
  private readonly logger = new Logger(AudioProcessor.name);

  constructor(
    // private readonly blockchainService: BlockchainService,
  ) {
  }


  @Process('transcode')
  handleTranscode(job: Job) {
    // const value = this.blockchainService.getCurrentBlockNum();
    this.logger.debug('Start transcoding...');
    this.logger.debug(job.data);
    // this.logger.debug(value);
    this.logger.debug('Transcoding completed');
  }
}
// import { Processor, Process, OnQueueActive, OnGlobalQueueCompleted } from '@nestjs/bull';
// import { Job } from 'bull';

// @Processor('snapshot')
// export class SnapshotConsumer {
//   @Process()
//   async cacheOneRow(job: Job<unknown>) {
//     let progress = 0;
//     for (let i = 0; i < 5; i++) {
//       await this.doSomething(job.data);
//       progress += 1;
//       await job.progress(progress);
//     }
//     return {};
//   }

//   async doSomething(data) {
//     console.log("queue:", data)
//   }

//   @OnQueueActive()
//   onActive(job: Job) {
//     console.log(
//       `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
//     );
//   }  

//   // @OnGlobalQueueCompleted()
//   // async onGlobalCompleted(jobId: number, result: any) {
//   //   const job = await this.immediateQueue.getJob(jobId);
//   //   console.log('(Global) on completed: job ', job.id, ' -> result: ', result);
//   // }  
// }