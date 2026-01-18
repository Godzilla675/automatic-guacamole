import unittest

class TestDogStory(unittest.TestCase):
    def test_tell_story(self):
        story = """
        Once upon a time, there was a good boy named Rex.
        He loved chasing squirrels and eating treats.
        One day, he found the biggest bone in the world.
        And he wagged his tail happily ever after.
        """
        print(story)
        self.assertIn("Rex", story)
        self.assertIn("bone", story)
