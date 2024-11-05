import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { UserData } from '../common/decorators';
import { User } from '../auth/user.entity';
import { AccessTokenGuard } from '../common/guards';
import {
  CreateAddressReq,
  CreateAddressRes,
  GetAddressReq,
  GetAddressRes,
  RemoveAddressReq,
  RemoveAddressRes,
  UpdateAddressReq,
  UpdateAddressRes,
} from './address.dto';
import { WebResponse } from '../model/web.model';

@UseGuards(AccessTokenGuard)
@Controller('/api/v1/contacts/:contactId/addresses')
export class AddressController {
  constructor(private addressService: AddressService) {}

  @Post()
  @HttpCode(201)
  async create(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Body() request: CreateAddressReq,
  ): Promise<WebResponse<CreateAddressRes>> {
    request.contactId = contactId;
    const result = await this.addressService.create(user, request);

    return {
      code: 201,
      status: 'Created',
      data: result,
    };
  }

  @Get('/:addressId')
  @HttpCode(200)
  async getAddress(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<GetAddressRes>> {
    const request: GetAddressReq = {
      contactId: contactId,
      addressId: addressId,
    };

    const result = await this.addressService.getAddress(user, request);

    return {
      code: 200,
      status: 'OK',
      data: result,
    };
  }

  @Patch('/:addressId')
  @HttpCode(200)
  async updateAddress(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
    @Body() request: UpdateAddressReq,
  ): Promise<WebResponse<UpdateAddressRes>> {
    request.id = addressId;
    request.contactId = contactId;

    const result = await this.addressService.updateAddress(user, request);

    return {
      code: 200,
      status: 'OK',
      data: result,
    };
  }

  @Delete('/:addressId')
  @HttpCode(200)
  async deleteAddress(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
    @Param('addressId', ParseIntPipe) addressId: number,
  ): Promise<WebResponse<RemoveAddressRes>> {
    const request: RemoveAddressReq = {
      contactId: contactId,
      addressId: addressId,
    };

    const result = await this.addressService.deleteAddress(user, request);

    return {
      code: 200,
      status: 'Deleted',
      data: result,
    };
  }

  @Get()
  @HttpCode(200)
  async listAddresses(
    @UserData() user: User,
    @Param('contactId', ParseIntPipe) contactId: number,
  ): Promise<WebResponse<GetAddressRes[]>> {
    const result = await this.addressService.listAddresses(user, contactId);

    return {
      code: 200,
      status: 'OK',
      data: result,
    };
  }
}
