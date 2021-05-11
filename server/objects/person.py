class Person:
    """
    The base Person class.
    """

    def __init__(self, first_name: str, last_name: str, phone: str) -> None:
        self.first_name = first_name
        self.last_name = last_name
        self.phone = phone
