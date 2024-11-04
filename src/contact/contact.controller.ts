import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { UserData } from '../common/decorators';
import { User } from '../auth/user.entity';
import {
  CreateContactRequest,
  CreateContactResponse,
  GetContactResponse,
  SearchContactReq,
  SearchContactRes,
  UpdateContactReq,
  UpdateContactRes,
} from './contact.dto';
import { WebResponse } from '../model/web.model';
import { AccessTokenGuard } from '../common/guards';

@Controller('/api/v1/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  @HttpCode(201)
  async create(
    @UserData() user: User,
    @Body() request: CreateContactRequest,
  ): Promise<WebResponse<CreateContactResponse>> {
    const result = await this.contactService.create(user, request);

    return {
      code: HttpStatus.CREATED,
      status: 'Created',
      data: result,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get('/:contactId')
  @HttpCode(200)
  async getContact(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<GetContactResponse>> {
    const result = await this.contactService.getContact(user, contactId);

    return {
      code: HttpStatus.OK,
      status: 'OK',
      data: result,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Delete('/:contactId')
  @HttpCode(200)
  async deleteContact(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<boolean>> {
    await this.contactService.deleteContact(user, contactId);

    return {
      code: HttpStatus.OK,
      status: 'No Content',
      data: true,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/:contactId')
  @HttpCode(200)
  async updateContact(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: UpdateContactReq,
  ): Promise<WebResponse<UpdateContactRes>> {
    request.id = contactId;
    const result = await this.contactService.updateContact(user, request);

    return {
      code: HttpStatus.OK,
      status: 'Updated',
      data: result,
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  @HttpCode(200)
  async searchContact(
    @UserData() user: User,
    @Query('username') username?: string,
    @Query('email') email?: string,
    @Query('phone') phone?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<SearchContactRes[]>> {
    const request: SearchContactReq = {
      username: username,
      email: email,
      phone: phone,
      page: page || 1,
      size: size || 10,
    };

    const result = await this.contactService.searchContact(user, request);

    return {
      code: HttpStatus.OK,
      status: 'OK',
      data: result.data,
      paging: result.paging,
    };
  }
}
