import { Module } from '@nestjs/common';
import { LiveClassesController } from './live-classes.controller';
import { MeetOAuthController } from './meet-oauth.controller';
import { MeetWebhooksController } from './meet-webhooks.controller';
import { LiveClassesService } from './live-classes.service';
import { GoogleMeetService } from './google-meet.service';
import { EncryptionService } from './encryption.service';

@Module({
    controllers: [LiveClassesController, MeetOAuthController, MeetWebhooksController],
    providers: [LiveClassesService, GoogleMeetService, EncryptionService],
    exports: [LiveClassesService, GoogleMeetService, EncryptionService],
})
export class LiveClassesModule { }
