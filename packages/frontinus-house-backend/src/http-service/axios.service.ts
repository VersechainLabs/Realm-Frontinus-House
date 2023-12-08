import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Address } from 'src/types/address';
import { BipRound } from 'src/bip-round/bip-round.entity';

export enum PostToDiscordTypes {
  CREATE_BIP = 'CREATE_BIP',
  COMMENT = 'COMMENT',
}

@Injectable()
export class AxiosService {
  constructor(
    private readonly httpService: HttpService
  ) {}

  removeTags(str) {
    if ((str===null) || (str===''))
        return false;
    else
        str = str.toString();
          
    // Regular expression to identify HTML tags in
    // the input string. Replacing the identified
    // HTML tag with a null string.
    return str.replace( /(<([^>]+)>)/ig, '');
  }

  titleToSlug(title: string) {
    return title.replaceAll('', '-').replaceAll('\/', '-').toLowerCase();
  }

  async postBipToDiscord(
    address: Address,
    bipRound: BipRound,
    type: PostToDiscordTypes,
    ){

    try {
      const contentMaxLetter = 150;
      let shortContent = this.removeTags(bipRound.content);
      if (shortContent.length > contentMaxLetter) {
        shortContent = shortContent.substring(0, contentMaxLetter) + "...";
      }
  
      const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_URL);
      // ens name:
      let ensName = await provider.lookupAddress(address);
      if (ensName == null) {
        // turn "0x32790deE22beD1916303e2c3F4253fC2cFc0c417" into "0x327...c417" for better look:
        ensName = address.substring(0, 5) + "..." + address.substring(address.length - 4);
      }
      // ens avatar:
      let ensAvatar = await provider.getAvatar(address);
      ensAvatar = ensAvatar == null ? "https://frontinus.house/bulb.png" : ensAvatar;
  
      // default use "comment" case:
      const sluggedTitle = this.titleToSlug(bipRound.title);
      let formatContent = `${ensName} replied in ${bipRound.title} \n https://frontinus.house/bip/${bipRound.id}-${sluggedTitle}`;
      // let formatContent = `${ensName} replied in ${bipRound.title} \n https://frontinus.house/bip/${bipRound.id}`;
      let discordUrl = process.env.DISCORD_WEBHOOK_COMMENT;
      switch (type) {
        case PostToDiscordTypes.COMMENT:
          
          break;
        case PostToDiscordTypes.CREATE_BIP:
          formatContent = `${ensName} posted a new BIP: ${bipRound.title} \n https://frontinus.house/bip/${bipRound.id}-${sluggedTitle}`;
          // formatContent = `${ensName} posted a new BIP: ${bipRound.title} \n https://frontinus.house/bip/${bipRound.id}`;
          discordUrl = process.env.DISCORD_WEBHOOK_NEW_BIP;
        default:
          break;
      }

      const params = {
        username: 'Frontinus House Admin',
        avatar_url: ensAvatar,
        content:  formatContent,
        embeds: [
          {
            "title": `${bipRound.title}`,
            "color": 15258703,
            "thumbnail": {
              // "url": "https://frontinus.house/bulb.png",
            },
            "fields": [
              {
                "name": ``,
                "value": shortContent,
                "inline": true
              }
            ]
          }
        ]
      }
  
      this.httpService.post(discordUrl, params)
       .subscribe(
        // response => console.log(response),
        error => console.log(error)
      );
    } catch (e) {
      console.log("Send to Discord through webhook failed.");
    }
  }

}
