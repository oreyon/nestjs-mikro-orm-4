export class CreateAddressReq {
  contactId: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class CreateAddressRes {
  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class GetAddressReq {
  contactId: number;
  addressId: number;
}

export class GetAddressRes {
  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class UpdateAddressReq {
  id: number;
  contactId: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class UpdateAddressRes {
  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}

export class RemoveAddressReq {
  contactId: number;
  addressId: number;
}

export class RemoveAddressRes {
  id: number;
  street?: string;
  city?: string;
  province?: string;
  country: string;
  postalCode?: string;
}
