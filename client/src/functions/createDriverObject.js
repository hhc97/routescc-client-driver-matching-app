class Volunteer {
	constructor(id, firstName, lastName, phone, cellPhone, address, addressString, city, driversLicenseExpiry) {
		this.id = id;
		this.firstName = firstName;
		this.lastName = lastName;
		this.phone = phone;
		this.cellPhone = cellPhone;
		this.address = address;
		this.addressString = `${addressString}, ${city}`;
		this.city = city;
		
		const licenseExpiry = driversLicenseExpiry.split('/');
		const licenseExpiryDay = licenseExpiry[0];
		const licenseExpiryMonth = licenseExpiry[1];
		const licenseExpiryYear = licenseExpiry[2];
		this.driversLicenseExpiry = new Date(licenseExpiryYear, licenseExpiryMonth, licenseExpiryDay);

		this.shouldFlag = Date.now() > this.driversLicenseExpiry;
	}
}

export const createDriverObject = ({ driver }) => {
  return new Volunteer(
    driver.id, 
    driver.first_name, 
    driver.last_name, 
    driver.phone, 
    driver.cell_phone, 
    driver.address,
    driver.address_str,
    driver.town, 
    driver.license_expiry
  )
}